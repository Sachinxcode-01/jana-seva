import http from 'http';
import https from 'https';
import { Readable } from 'stream';
import { CONFIG } from '../../config.js';
import {
  VoiceStudioHealth,
  VoiceStudioModel,
  VoiceProfile,
  SupportedLanguageInfo,
  SpeechSynthesisOptions,
  SpeechSynthesisResult,
  SpeechTranscriptionResult
} from './voice.types.js';

export class VoiceStudioClient {
  private baseUrl: string;
  private cachedHealth: VoiceStudioHealth | null = null;
  private lastHealthCheckTime = 0;
  private readonly HEALTH_CACHE_TTL_MS = 8000; // 8s cache

  // Dynamic discovery caches
  private cachedModels: VoiceStudioModel[] | null = null;
  private cachedVoices: any[] | null = null;
  private lastDiscoveryTime = 0;
  private readonly DISCOVERY_CACHE_TTL_MS = 30000; // 30s cache

  constructor(baseUrl = CONFIG.VOICESTUDIO_URL || 'http://localhost:3900') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health check and dynamic capability discovery of running VoiceStudio service
   */
  public async getHealth(forceRefresh = false): Promise<VoiceStudioHealth> {
    const now = Date.now();
    if (!forceRefresh && this.cachedHealth && (now - this.lastHealthCheckTime < this.HEALTH_CACHE_TTL_MS)) {
      return this.cachedHealth;
    }

    const startTime = Date.now();
    const wellKnownUrl = `${this.baseUrl}/.well-known/voicestudio-speech`;
    const healthUrl = `${this.baseUrl}/health`;

    try {
      const resp = await this.makeRequest<any>(wellKnownUrl, { method: 'GET', timeoutMs: 3000 });
      const latencyMs = Date.now() - startTime;
      const models = await this.listModels().catch(() => []);
      const voices = await this.listVoices().catch(() => []);

      const voiceIds = voices.length > 0
        ? voices.map(v => typeof v === 'string' ? v : (v.voice_id || v.id || v.name))
        : ['kavya-indic', 'priya-in', 'neerja-in', 'nova-in'];

      this.cachedHealth = {
        online: true,
        serviceUrl: this.baseUrl,
        engine: resp.engine || 'omnivoice',
        version: resp.version || '1.0.0',
        voices: voiceIds,
        models: models.map(m => m.id),
        supportedLanguages: ['kn', 'en', 'hi', 'te', 'ta', 'ml', 'mr', 'bn', 'gu'],
        latencyMs,
        lastChecked: new Date().toISOString()
      };
      this.lastHealthCheckTime = now;
      return this.cachedHealth;
    } catch {
      // Fallback: check /health
      try {
        const resp2 = await this.makeRequest<any>(healthUrl, { method: 'GET', timeoutMs: 2500 });
        const latencyMs = Date.now() - startTime;
        const models = await this.listModels().catch(() => []);

        this.cachedHealth = {
          online: true,
          serviceUrl: this.baseUrl,
          engine: resp2.engine || 'omnivoice',
          version: resp2.version || '1.0.0',
          models: models.map(m => m.id),
          supportedLanguages: ['kn', 'en', 'hi'],
          latencyMs,
          lastChecked: new Date().toISOString()
        };
        this.lastHealthCheckTime = now;
        return this.cachedHealth;
      } catch (err: any) {
        this.cachedHealth = {
          online: false,
          serviceUrl: this.baseUrl,
          error: err.message || 'VoiceStudio server unreachable on port 3900',
          lastChecked: new Date().toISOString()
        };
        this.lastHealthCheckTime = now;
        return this.cachedHealth;
      }
    }
  }

  /**
   * Dynamically queries GET /v1/models from VoiceStudio (OpenAI specification)
   */
  public async listModels(forceRefresh = false): Promise<VoiceStudioModel[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedModels && (now - this.lastDiscoveryTime < this.DISCOVERY_CACHE_TTL_MS)) {
      return this.cachedModels;
    }

    try {
      const res = await this.makeRequest<{ data?: VoiceStudioModel[] }>(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        timeoutMs: 3500
      });

      const models = (res.data || []).map(m => ({
        id: m.id,
        object: m.object || 'model',
        owned_by: m.owned_by || 'voicestudio',
        ready: m.ready !== false,
        type: (m.id.includes('whisper') || m.id.includes('asr')) ? ('stt' as const) : ('tts' as const)
      }));

      this.cachedModels = models;
      this.lastDiscoveryTime = now;
      return models;
    } catch {
      return [];
    }
  }

  /**
   * Dynamically queries GET /v1/audio/voices from VoiceStudio
   */
  public async listVoices(forceRefresh = false): Promise<any[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedVoices && (now - this.lastDiscoveryTime < this.DISCOVERY_CACHE_TTL_MS)) {
      return this.cachedVoices;
    }

    try {
        const res = await this.makeRequest<any>(`${this.baseUrl}/v1/audio/voices`, {
          method: 'GET',
        timeoutMs: 3500
        });

        const raw = Array.isArray(res) ? res : (res.voices || res.data || []);
        this.cachedVoices = raw;
        this.lastDiscoveryTime = now;
        return raw;
      } catch {
        return [];
      }
    }

  /**
   * Dynamically resolves the best active TTS model without hardcoding unverified names
   */
  public async resolveTtsModel(): Promise<string> {
    const models = await this.listModels();
    // Prioritize discovered models in order of capability
    const ttsCandidate = models.find(m => m.id === 'omnivoice' || m.id === 'tts-1-hd' || m.id === 'tts-1');
    if (ttsCandidate) return ttsCandidate.id;
    if (models.length > 0 && models[0].type === 'tts') return models[0].id;
    return 'omnivoice'; // Standard default
  }

  /**
   * Dynamically resolves the best active STT model
   */
  public async resolveSttModel(): Promise<string> {
    const models = await this.listModels();
    const sttCandidate = models.find(m => m.id === 'whisper-large-v3' || m.id === 'whisper-1' || m.type === 'stt');
    if (sttCandidate) return sttCandidate.id;
    return 'whisper-large-v3';
  }

  /**
   * Resolves and verifies the target voice identifier against active engine capabilities
   */
  public async resolveVoice(requestedVoice = 'kavya-indic'): Promise<string> {
    const available = await this.listVoices();
    if (available.length === 0) return requestedVoice;

    // Check direct match by id or name
    const match = available.find(v => {
      const id = v.voice_id || v.id || v.name;
      return id && id.toLowerCase() === requestedVoice.toLowerCase();
    });

    if (match) return match.voice_id || match.id || match.name;

    // Check if an Indian female voice profile is available
    const indianFemale = available.find(v => {
      const desc = (v.description || v.accent || v.name || '').toLowerCase();
      return desc.includes('indian') && (desc.includes('female') || desc.includes('kavya') || desc.includes('priya'));
    });
    if (indianFemale) return indianFemale.voice_id || indianFemale.id || indianFemale.name;

    // Fallback to OpenAI alias standard
    const openaiNova = available.find(v => (v.voice_id || v.id || v.name) === 'nova');
    if (openaiNova) return 'nova';

    return requestedVoice;
  }

  /**
   * Synthesizes speech via POST /v1/audio/speech with timeout and error handling
   */
  public async synthesizeSpeech(
    text: string,
    options: SpeechSynthesisOptions = {}
  ): Promise<SpeechSynthesisResult | null> {
    const url = `${this.baseUrl}/v1/audio/speech`;
    const model = await this.resolveTtsModel();
    const voice = await this.resolveVoice(options.voice || 'kavya-indic');
    const responseFormat = options.responseFormat || 'mp3';
    const speed = options.speed || 0.94; // Calm, respectful pacing for citizen welfare clarity

    const payload = JSON.stringify({
      model,
      input: text,
      voice,
      speed,
      response_format: responseFormat,
      instructions: options.instructions || 'Indian female voice, warm, clear, polite, citizen welfare assistant'
    });

    return new Promise((resolve) => {
      try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload, 'utf8')
          },
          timeout: 20000 // 20s timeout protection
        }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            let errText = '';
            res.on('data', d => errText += d);
            res.on('end', () => {
              console.warn(`[VoiceStudioClient] TTS HTTP ${res.statusCode}: ${errText}`);
              resolve(null);
            });
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            const audioBuffer = Buffer.concat(chunks);
            const contentType = res.headers['content-type'] || (responseFormat === 'wav' ? 'audio/wav' : 'audio/mpeg');
            resolve({
              audioBuffer,
              contentType,
              voiceUsed: voice
            });
          });
        });

        req.on('error', (err) => {
          console.warn('[VoiceStudioClient] Request error during TTS:', err.message);
          resolve(null);
        });

        req.on('timeout', () => {
          console.warn('[VoiceStudioClient] TTS request timed out after 20s');
          req.destroy();
          resolve(null);
        });

        req.write(payload);
        req.end();
      } catch (err) {
        console.warn('[VoiceStudioClient] Exception initiating TTS:', err);
        resolve(null);
      }
    });
  }

  /**
   * Streams audio chunks via POST /v1/audio/speech with chunked transfer
   */
  public async synthesizeSpeechStream(
    text: string,
    options: SpeechSynthesisOptions = {},
    onChunk: (chunk: Buffer) => void
  ): Promise<boolean> {
    const url = `${this.baseUrl}/v1/audio/speech`;
    const model = await this.resolveTtsModel();
    const voice = await this.resolveVoice(options.voice || 'kavya-indic');
    const responseFormat = options.responseFormat || 'mp3';

    const payload = JSON.stringify({
      model,
      input: text,
      voice,
      speed: options.speed || 0.94,
      response_format: responseFormat,
      stream_format: 'audio',
      instructions: options.instructions || 'Indian female voice, warm, clear, polite, citizen welfare assistant'
    });

    return new Promise((resolve) => {
      try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload, 'utf8')
          },
          timeout: 25000
        }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            resolve(false);
            return;
          }

          res.on('data', (chunk: Buffer) => {
            onChunk(chunk);
          });

          res.on('end', () => {
            resolve(true);
          });
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.write(payload);
        req.end();
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Transcribes speech via POST /v1/audio/transcriptions (OpenAI specification multipart upload)
   */
  public async transcribeSpeech(
    audioBuffer: Buffer,
    language = 'en',
    mimeType = 'audio/webm'
  ): Promise<SpeechTranscriptionResult | null> {
    const url = `${this.baseUrl}/v1/audio/transcriptions`;
    const model = await this.resolveSttModel();
    const boundary = `----VoiceStudioBoundary${Math.random().toString(36).substring(2)}`;

    // Build standard multipart body
    let header = `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="model"\r\n\r\n${model}\r\n`;
    header += `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="language"\r\n\r\n${language}\r\n`;
    header += `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="file"; filename="audio_capture.webm"\r\n`;
    header += `Content-Type: ${mimeType}\r\n\r\n`;

    const footer = `\r\n--${boundary}--\r\n`;
    const headerBuf = Buffer.from(header, 'utf8');
    const footerBuf = Buffer.from(footer, 'utf8');
    const totalLength = headerBuf.length + audioBuffer.length + footerBuf.length;

    return new Promise((resolve) => {
      try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': totalLength
          },
          timeout: 25000 // 25s timeout
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode < 400) {
              try {
                const json = JSON.parse(body);
                resolve({
                  text: (json.text || '').trim(),
                  languageDetected: json.language || language,
                  confidence: 0.95
                });
              } catch {
                resolve({ text: body.trim(), languageDetected: language, confidence: 0.85 });
              }
            } else {
              console.warn(`[VoiceStudioClient] STT HTTP ${res.statusCode}: ${body}`);
              resolve(null);
            }
          });
        });

        req.on('error', (err) => {
          console.warn('[VoiceStudioClient] STT network error:', err.message);
          resolve(null);
        });

        req.on('timeout', () => {
          console.warn('[VoiceStudioClient] STT request timed out after 25s');
          req.destroy();
          resolve(null);
        });

        req.write(headerBuf);
        req.write(audioBuffer);
        req.write(footerBuf);
        req.end();
      } catch (err) {
        console.warn('[VoiceStudioClient] STT exception:', err);
        resolve(null);
      }
    });
  }

  private makeRequest<T>(urlStr: string, options: { method: string; timeoutMs?: number; body?: string }): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(urlStr);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.request(urlStr, {
          method: options.method,
          timeout: options.timeoutMs || 4000,
          headers: { 'Accept': 'application/json' }
        }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            if (res.statusCode && res.statusCode < 400) {
              try {
                resolve(JSON.parse(body) as T);
              } catch {
                resolve(body as unknown as T);
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Connection to ${urlStr} timed out`));
        });

        if (options.body) req.write(options.body);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const voiceStudioClient = new VoiceStudioClient();
