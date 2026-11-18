import http from 'http';
import https from 'https';
import { CONFIG } from '../config.js';

export interface VoiceStudioStatus {
  online: boolean;
  serviceUrl: string;
  engine?: string;
  voices?: string[];
  error?: string;
}

/**
 * Checks whether local VoiceStudio server is running and reachable
 */
export async function checkVoiceStudioHealth(): Promise<VoiceStudioStatus> {
  const url = `${CONFIG.VOICESTUDIO_URL}/.well-known/voicestudio-speech`;

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.get(
        url,
        {
          timeout: 2000,
          headers: { 'Accept': 'application/json' }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode && res.statusCode < 400) {
              try {
                const json = JSON.parse(data);
                resolve({
                  online: true,
                  serviceUrl: CONFIG.VOICESTUDIO_URL,
                  engine: json.engine || 'omnivoice',
                  voices: json.voices || ['nova', 'alloy', 'shimmer', 'echo', 'fable', 'onyx']
                });
              } catch {
                resolve({
                  online: true,
                  serviceUrl: CONFIG.VOICESTUDIO_URL,
                  engine: 'omnivoice'
                });
              }
            } else {
              checkModelsFallback(resolve);
            }
          });
        }
      );

      req.on('error', (err) => {
        resolve({
          online: false,
          serviceUrl: CONFIG.VOICESTUDIO_URL,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          online: false,
          serviceUrl: CONFIG.VOICESTUDIO_URL,
          error: 'Connection timed out'
        });
      });
    } catch (err: any) {
      resolve({
        online: false,
        serviceUrl: CONFIG.VOICESTUDIO_URL,
        error: err.message
      });
    }
  });
}

function checkModelsFallback(resolve: (status: VoiceStudioStatus) => void) {
  const url = `${CONFIG.VOICESTUDIO_URL}/v1/models`;
  try {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.get(url, { timeout: 1500 }, (res) => {
      if (res.statusCode && res.statusCode < 400) {
        resolve({
          online: true,
          serviceUrl: CONFIG.VOICESTUDIO_URL,
          engine: 'omnivoice'
        });
      } else {
        resolve({
          online: false,
          serviceUrl: CONFIG.VOICESTUDIO_URL,
          error: `HTTP ${res.statusCode}`
        });
      }
    });
    req.on('error', (err) => {
      resolve({
        online: false,
        serviceUrl: CONFIG.VOICESTUDIO_URL,
        error: err.message
      });
    });
  } catch (err: any) {
    resolve({
      online: false,
      serviceUrl: CONFIG.VOICESTUDIO_URL,
      error: err.message
    });
  }
}

function getVoiceStudioInstructions(language: string): string {
  switch (language) {
    case 'kn':
      return 'indian female voice, kannada, warm, polite, clear, citizen welfare assistant';
    case 'hi':
      return 'indian female voice, hindi, respectful, polite, clear, citizen welfare assistant';
    case 'te':
      return 'indian female voice, telugu, warm, polite, clear, citizen welfare assistant';
    case 'ta':
      return 'indian female voice, tamil, warm, polite, clear, citizen welfare assistant';
    case 'mr':
      return 'indian female voice, marathi, warm, polite, clear, citizen welfare assistant';
    case 'ml':
      return 'indian female voice, malayalam, warm, polite, clear, citizen welfare assistant';
    case 'bn':
      return 'indian female voice, bengali, warm, polite, clear, citizen welfare assistant';
    case 'gu':
      return 'indian female voice, gujarati, warm, polite, clear, citizen welfare assistant';
    case 'pa':
      return 'indian female voice, punjabi, warm, polite, clear, citizen welfare assistant';
    case 'ur':
      return 'indian female voice, urdu, respectful, polite, clear, citizen welfare assistant';
    case 'en':
    default:
      return 'indian female voice, indian english accent, warm, professional, clear, respectful';
  }
}

/**
 * Synthesizes text to speech using VoiceStudio local OpenAI-compatible endpoint
 */
export async function synthesizeSpeechVoiceStudio(
  text: string,
  language = 'en',
  voice = 'nova'
): Promise<{ audioBuffer: Buffer; contentType: string } | null> {
  const url = `${CONFIG.VOICESTUDIO_URL}/v1/audio/speech`;

  const payload = JSON.stringify({
    model: 'omnivoice',
    input: text,
    voice: voice,
    response_format: 'mp3',
    instructions: getVoiceStudioInstructions(language)
  });

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 20000
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            let errBody = '';
            res.on('data', (c) => (errBody += c));
            res.on('end', () => {
              console.warn(`[VoiceStudio] TTS failed HTTP ${res.statusCode}: ${errBody}`);
              resolve(null);
            });
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const audioBuffer = Buffer.concat(chunks);
            const contentType = res.headers['content-type'] || 'audio/mpeg';
            resolve({ audioBuffer, contentType });
          });
        }
      );

      req.on('error', (err) => {
        console.warn(`[VoiceStudio] Error connecting to local VoiceStudio TTS: ${err.message}`);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.warn('[VoiceStudio] Request build error:', err);
      resolve(null);
    }
  });
}

/**
 * Transcribes audio to text using VoiceStudio local Whisper STT endpoint
 */
export async function transcribeSpeechVoiceStudio(
  audioBuffer: Buffer,
  language = 'en'
): Promise<{ text: string } | null> {
  const url = `${CONFIG.VOICESTUDIO_URL}/v1/audio/transcriptions`;
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
  const langParam = language || 'en';

  let header = `--${boundary}\r\n`;
  header += `Content-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`;
  header += `--${boundary}\r\n`;
  header += `Content-Disposition: form-data; name="language"\r\n\r\n${langParam}\r\n`;
  header += `--${boundary}\r\n`;
  header += `Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n`;
  header += `Content-Type: audio/webm\r\n\r\n`;

  const footer = `\r\n--${boundary}--\r\n`;

  const headerBuffer = Buffer.from(header, 'utf-8');
  const footerBuffer = Buffer.from(footer, 'utf-8');
  const totalLength = headerBuffer.length + audioBuffer.length + footerBuffer.length;

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': totalLength
        },
        timeout: 25000
      }, (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode < 400) {
            try {
              const json = JSON.parse(body);
              resolve({ text: json.text || '' });
            } catch {
              resolve({ text: body });
            }
          } else {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });

      req.write(headerBuffer);
      req.write(audioBuffer);
      req.write(footerBuffer);
      req.end();
    } catch {
      resolve(null);
    }
  });
}
