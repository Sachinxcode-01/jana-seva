import http from 'http';
import https from 'https';
import { IAIProvider } from './ai-provider.interface.js';
import { AIRequest, AIResponse, ResponseLength } from '../types.js';
import { CONFIG } from '../../../config.js';

export class OpenAICompatibleProvider implements IAIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey = CONFIG.OPENAI_API_KEY,
    baseUrl = CONFIG.OPENAI_BASE_URL,
    model = CONFIG.OPENAI_MODEL
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
  }

  public async isAvailable(): Promise<boolean> {
    // If local endpoint (e.g. localhost/127.0.0.1 for Ollama/vLLM), apiKey is optional
    const isLocal = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
    return Boolean((this.apiKey && this.apiKey.trim().length > 0) || isLocal);
  }

  public getProviderName(): string {
    return `OpenAI-Compatible (${this.model})`;
  }

  public async generateResponse(request: AIRequest): Promise<AIResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const payload = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(request) },
        ...(request.history || []).slice(-6).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: request.prompt }
      ],
      temperature: 0.25,
      max_tokens: this.getMaxTokens(request.responseLength)
    });

    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;

        const headers: Record<string, string | number> = {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        };
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const req = client.request(url, {
          method: 'POST',
          headers,
          timeout: 18000
        }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            if (res.statusCode && res.statusCode < 300) {
              try {
                const data = JSON.parse(body);
                const text = data.choices?.[0]?.message?.content || '';
                resolve({
                  text: text.trim(),
                  modelUsed: this.model,
                  providerName: 'OpenAI-Compatible',
                  confidence: 0.95,
                  tokensUsed: data.usage?.total_tokens
                });
              } catch (e: any) {
                reject(new Error(`Failed to parse response: ${e.message}`));
              }
            } else {
              reject(new Error(`OpenAI API error (${res.statusCode}): ${body}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('OpenAI request timed out'));
        });

        req.write(payload);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  public async streamResponse(
    request: AIRequest,
    onChunk: (token: string) => void
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const payload = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(request) },
        ...(request.history || []).slice(-6).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: request.prompt }
      ],
      temperature: 0.25,
      max_tokens: this.getMaxTokens(request.responseLength),
      stream: true
    });

    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;

        const headers: Record<string, string | number> = {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        };
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        let fullText = '';

        const req = client.request(url, {
          method: 'POST',
          headers,
          timeout: 22000
        }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            let errBody = '';
            res.on('data', d => errBody += d);
            res.on('end', () => reject(new Error(`Stream error HTTP ${res.statusCode}: ${errBody}`)));
            return;
          }

          let buffer = '';
          res.on('data', (chunk: Buffer) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              if (jsonStr === '[DONE]') continue;

              try {
                const parsedChunk = JSON.parse(jsonStr);
                const delta = parsedChunk.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  onChunk(delta);
                }
              } catch {}
            }
          });

          res.on('end', () => {
            resolve({
              text: fullText.trim(),
              modelUsed: this.model,
              providerName: 'OpenAI-Compatible (Streaming)',
              confidence: 0.95
            });
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('OpenAI streaming request timed out'));
        });

        req.write(payload);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private getMaxTokens(length: ResponseLength = 'standard'): number {
    switch (length) {
      case 'concise': return 250;
      case 'detailed': return 1200;
      case 'standard':
      default:
        return 650;
    }
  }

  private buildSystemPrompt(request: AIRequest): string {
    const { language, groundingContextText = '', responseLength = 'standard', isFollowUp, activeScheme } = request;

    let lengthInstruction = 'Provide a structured, helpful explanation (~150-250 words).';
    if (responseLength === 'concise') {
      lengthInstruction = 'Be very brief and direct (~60-120 words), optimized for quick mobile screen reading or voice audio.';
    } else if (responseLength === 'detailed') {
      lengthInstruction = 'Provide a comprehensive breakdown with all eligibility clauses, complete document lists, and detailed step-by-step application instructions.';
    }

    let langInstruction = 'Respond in natural, fluent Indian English.';
    if (language === 'kn') {
      langInstruction = 'Respond entirely in natural, respectful Kannada (ಕನ್ನಡ) script with polite Kannada honorifics.';
    } else if (language === 'hi') {
      langInstruction = 'Respond entirely in clear, respectful Hindi (हिंदी) script with polite honorifics (जी, आपका).';
    }

    let contextNote = '';
    if (isFollowUp && activeScheme) {
      contextNote = `NOTE: The user is asking a follow-up question specifically about: "${activeScheme}". Maintain this scheme context unless they explicitly change topics.`;
    }

    return `You are "Janaseva Assistant" (Voice Profile: Kavya), an empathetic, knowledgeable public welfare advisor helping Indian citizens access verified government schemes.

### Primary Directives:
1. Grounding: Rely EXCLUSIVELY on the verified government scheme context provided below. Never invent benefits, income limits, or deadlines.
2. Privacy First: Never ask for or accept Aadhaar numbers, bank passwords, or OTPs. If a citizen shares them, instruct them to delete them immediately.
3. Anti-Fraud Alert: Remind citizens that official government applications on portals like Seva Sindhu, PM-KISAN, and SSP are completely free of charge.
4. Response Length: ${lengthInstruction}
5. Language: ${langInstruction}
${contextNote}

### Verified Government Scheme Database Context:
${groundingContextText}
`;
  }
}
