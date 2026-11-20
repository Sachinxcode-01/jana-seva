import http from 'http';
import https from 'https';
import { CONFIG } from '../../config.js';
import {
  VoiceStudioHealth,
  VoiceStudioModel,
  VoiceProfile,
  SpeechSynthesisOptions,
  SpeechSynthesisResult,
  SpeechTranscriptionResult
} from './voice.types.js';

export class VoiceStudioClient {
  private baseUrl: string;
  private cachedHealth: VoiceStudioHealth | null = null;
  private lastHealthCheckTime = 0;
  private readonly HEALTH_CACHE_TTL_MS = 10000; // 10s cache

  constructor(baseUrl = CONFIG.VOICESTUDIO_URL || 'http://localhost:3900') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health check and dynamic discovery of VoiceStudio running server
   */
  public async getHealth(forceRefresh = false): Promise<VoiceStudioHealth> {
    const now = Date.now();
    if (!forceRefresh && this.cachedHealth && (now - this.lastHealthCheckTime < this.HEALTH_CACHE_TTL_MS)) {
      return this.cachedHealth;
    }

    const wellKnownUrl = `${this.baseUrl}/.well-known/voicestudio-speech`;
    const healthUrl = `${this.baseUrl}/health`;

    try {
      const resp = await this.makeRequest<any>(wellKnownUrl, { method: 'GET', timeoutMs: 2500 });
      const models = await this.listModels().catch(() => []);
      const voices = await this.listVoices().catch(() => ['kavya-indic', 'priya-in', 'nova-in']);

      this.cachedHealth = {
        online: true,
        serviceUrl: this.baseUrl,
        engine: resp.engine || 'omnivoice',
        version: resp.version || '1.0.0',
        voices: voices.length > 0 ? voices.map(v => typeof v === 'string' ? v : v.id) : ['kavya-indic', 'priya-in', 'nova-in'],
        models: models.map(m => m.id),
        lastChecked: new Date().toISOString()
      };
      this.lastHealthCheckTime = now;
      return this.cachedHealth;
    } catch {
      // Try fallback /health
      try {
        const resp2 = await this.makeRequest<any>(healthUrl, { method: 'GET', timeoutMs: 2000 });
        this.cachedHealth = {
          online: true,
          serviceUrl: this.baseUrl,
          engine: resp2.engine || 'omnivoice',
          version: resp2.version || '1.0.0',
          lastChecked: new Date().toISOString()
        };
        this.lastHealthCheckTime = now;
        return this.cachedHealth;
      } catch (err: any) {
        this.cachedHealth = {
          online: false,
          serviceUrl: this.baseUrl,
          error: err.message || 'VoiceStudio server unreachable',
          lastChecked: new Date().toISOString()
        };
        this.lastHealthCheckTime = now;
        return this.cachedHealth;
      }
    }
  }

  /**
   * Dynamically query GET /v1/models
   */
  public async listModels(): Promise<VoiceStudioModel[]> {
    try {
      const res = await this.makeRequest<{ data?: VoiceStudioModel[] }>(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        timeoutMs: 3000
      });
      return res.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Query GET /v1/audio/voices
   */
  public async listVoices(): Promise<any[]> {
    try {
      const res = await this.makeRequest<{ voices?: any[]; data?: any[] }>(`${this.baseUrl}/v1/audio/voices`, {
        method: 'GET',
        timeoutMs: 3000
      });
      return res.voices || res.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Synthesizes speech via POST /v1/audio/speech
   */
  public async synthesizeSpeech(
    text: string,
    options: SpeechSynthesisOptions = {}
  ): Promise<SpeechSynthesisResult | null> {
    const url = `${this.baseUrl}/v1/audio/speech`;
    const voice = options.voice || 'kavya-indic';
    const responseFormat = options.responseFormat || 'mp3';
    const speed = options.speed || 0.94; // Calm, respectful pacing for citizen welfare clarity

    const payload = JSON.stringify({
      model: 'omnivoice',
      input: text,
      voice: voice,
      speed: speed,
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
          timeout: 20000
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
            resolve({ audioBuffer, contentType });
          });
        });

        req.on('error', (err) => {
          console.warn('[VoiceStudioClient] Request error during TTS:', err.message);
          resolve(null);
        });

        req.on('timeout', () => {
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
   * Transcribes speech via POST /v1/audio/transcriptions
   */
  public async transcribeSpeech(
    audioBuffer: Buffer,
    language = 'en',
    mimeType = 'audio/webm'
  ): Promise<SpeechTranscriptionResult | null> {
    const url = `${this.baseUrl}/v1/audio/transcriptions`;
    const boundary = `----VoiceStudioBoundary${Math.random().toString(36).substring(2)}`;

    let header = `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`;
    header += `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="language"\r\n\r\n${language}\r\n`;
    header += `--${boundary}\r\n`;
    header += `Content-Disposition: form-data; name="file"; filename="input_audio.webm"\r\n`;
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
          timeout: 25000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode < 400) {
              try {
                const json = JSON.parse(body);
                resolve({
                  text: json.text || '',
                  languageDetected: json.language || language
                });
              } catch {
                resolve({ text: body.trim(), languageDetected: language });
              }
            } else {
              console.warn(`[VoiceStudioClient] STT HTTP ${res.statusCode}: ${body}`);
              resolve(null);
            }
          });
        });

        req.on('error', (err) => {
          console.warn('[VoiceStudioClient] STT error:', err.message);
          resolve(null);
        });

        req.on('timeout', () => {
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
          timeout: options.timeoutMs || 5000,
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
