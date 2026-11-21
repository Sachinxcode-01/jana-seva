import https from 'https';
import { IAIProvider } from './ai-provider.interface.js';
import { AIRequest, AIResponse, ResponseLength } from '../types.js';
import { CONFIG } from '../../../config.js';

export class OpenRouterProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey = CONFIG.OPENROUTER_API_KEY, model = CONFIG.OPENROUTER_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public getProviderName(): string {
    return `OpenRouter (${this.model})`;
  }

  public async generateResponse(request: AIRequest): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(request);
    const messages = this.buildMessages(systemPrompt, request);

    const payload = JSON.stringify({
      model: this.model,
      messages,
      temperature: 0.25,
      max_tokens: this.getMaxTokens(request.responseLength),
      include_reasoning: false
    });

    return new Promise((resolve, reject) => {
      try {
        const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://janaseva.karnataka.gov.in',
            'X-Title': 'JANASEVA Citizen Welfare AI Assistant',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 22000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const data = JSON.parse(body);
                const reply = data.choices?.[0]?.message?.content || '';
                if (!reply.trim()) {
                  reject(new Error('OpenRouter response content was empty.'));
                  return;
                }
                resolve({
                  text: reply.trim(),
                  modelUsed: this.model,
                  providerName: 'OpenRouter',
                  confidence: 0.95,
                  tokensUsed: data.usage?.total_tokens
                });
              } catch (parseErr: any) {
                reject(new Error(`Failed to parse OpenRouter response: ${parseErr.message}`));
              }
            } else {
              reject(new Error(`OpenRouter API error (HTTP ${res.statusCode}): ${body}`));
            }
          });
        });

        req.on('error', (err) => reject(new Error(`OpenRouter network error: ${err.message}`)));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('OpenRouter request timed out after 22 seconds'));
        });

        req.write(payload);
        req.end();
      } catch (err: any) {
        reject(err);
      }
    });
  }

  public async streamResponse(
    request: AIRequest,
    onChunk: (token: string) => void
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(request);
    const messages = this.buildMessages(systemPrompt, request);

    const payload = JSON.stringify({
      model: this.model,
      messages,
      temperature: 0.25,
      max_tokens: this.getMaxTokens(request.responseLength),
      include_reasoning: false,
      stream: true
    });

    return new Promise((resolve, reject) => {
      try {
        let fullText = '';

        const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://janaseva.karnataka.gov.in',
            'X-Title': 'JANASEVA Citizen Welfare AI Assistant',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 25000
        }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            let errBody = '';
            res.on('data', d => errBody += d);
            res.on('end', () => reject(new Error(`OpenRouter stream HTTP ${res.statusCode}: ${errBody}`)));
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
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  onChunk(delta);
                }
              } catch {}
            }
          });

          res.on('end', () => {
            if (!fullText.trim()) {
              reject(new Error('OpenRouter streaming produced empty text.'));
              return;
            }
            resolve({
              text: fullText.trim(),
              modelUsed: this.model,
              providerName: 'OpenRouter (Streaming)',
              confidence: 0.95
            });
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('OpenRouter streaming timed out'));
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
      case 'concise': return 1000;
      case 'detailed': return 2500;
      case 'standard':
      default:
        return 1800;
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

  private buildMessages(systemPrompt: string, request: AIRequest): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (request.history && request.history.length > 0) {
      const recent = request.history.slice(-6);
      for (const turn of recent) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }

    messages.push({ role: 'user', content: request.prompt });
    return messages;
  }
}
