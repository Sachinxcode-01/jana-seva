import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { assistantService } from '../assistant/assistant.service.js';
import { conversationService } from '../assistant/conversation.service.js';
import { voiceService } from './voice.service.js';

interface StreamSession {
  ws: WebSocket;
  conversationId?: string;
  language: string;
  voice: string;
  isCancelled: boolean;
  activeGenerationId: string | null;
}

export class VoiceStreamGateway {
  private wss: WebSocketServer | null = null;
  private sessions = new Map<WebSocket, StreamSession>();

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/assistant' });

    this.wss.on('connection', (ws: WebSocket) => {
      const session: StreamSession = {
        ws,
        language: 'kn',
        voice: 'kavya-indic',
        isCancelled: false,
        activeGenerationId: null
      };
      this.sessions.set(ws, session);

      // Send initial ready event
      this.sendJson(ws, {
        type: 'ready',
        message: 'JANASEVA Voice Assistant WebSocket Gateway Connected',
        availableVoices: voiceService.getVoiceProfiles().map(v => v.id)
      });

      ws.on('message', async (data: Buffer | string) => {
        try {
          const payload = JSON.parse(data.toString());
          await this.handleClientMessage(session, payload);
        } catch (err: any) {
          this.sendJson(ws, { type: 'error', message: 'Invalid WebSocket payload: ' + err.message });
        }
      });

      ws.on('close', () => {
        session.isCancelled = true;
        this.sessions.delete(ws);
      });

      ws.on('error', (err) => {
        console.warn('[VoiceStreamGateway] WebSocket error:', err.message);
        session.isCancelled = true;
        this.sessions.delete(ws);
      });
    });

    console.log('✔ Real-Time Voice Assistant WebSocket Gateway mounted on /ws/assistant');
  }

  private async handleClientMessage(session: StreamSession, payload: any): Promise<void> {
    const { ws } = session;

    switch (payload.type) {
      case 'init': {
        session.conversationId = payload.conversationId;
        if (payload.language) session.language = payload.language;
        if (payload.voice) session.voice = payload.voice;
        this.sendJson(ws, {
          type: 'initialized',
          conversationId: session.conversationId,
          language: session.language,
          voice: session.voice
        });
        break;
      }

      case 'interrupt': {
        // Immediate Barge-In: mark current generation as cancelled
        session.isCancelled = true;
        session.activeGenerationId = null;
        this.sendJson(ws, {
          type: 'interrupted',
          state: 'idle',
          message: 'Assistant voice output stopped.'
        });
        break;
      }

      case 'query':
      case 'message': {
        const text = payload.text || payload.message;
        if (!text || typeof text !== 'string') {
          this.sendJson(ws, { type: 'error', message: 'Message text is required.' });
          return;
        }

        const generationId = `gen_${Date.now()}`;
        session.activeGenerationId = generationId;
        session.isCancelled = false;

        const lang = payload.language || session.language;

        // 1. Notify state: Thinking
        this.sendJson(ws, { type: 'state', state: 'thinking', generationId });

        // Retrieve existing conversation history if session has conversationId
        let historyTurns: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
        if (session.conversationId) {
          const conv = conversationService.getConversation(session.conversationId);
          if (conv) {
            historyTurns = conv.messages.map(m => ({ role: m.role, content: m.content }));
            conversationService.addMessage(session.conversationId, {
              role: 'user',
              content: text.trim(),
              language: lang
            });
          }
        }

        // 2. Notify state: Retrieving Scheme Knowledge
        this.sendJson(ws, { type: 'state', state: 'retrieving', generationId });

        const result = await assistantService.processQuery(text.trim(), lang, historyTurns);

        // Check if citizen interrupted while AI was thinking
        if (session.isCancelled || session.activeGenerationId !== generationId) {
          return;
        }

        // 3. Send metadata event
        this.sendJson(ws, {
          type: 'metadata',
          generationId,
          language: result.language,
          suggestedSchemes: result.suggestedSchemes,
          modelUsed: result.modelUsed
        });

        // 4. Notify state: Speaking
        this.sendJson(ws, { type: 'state', state: 'speaking', generationId });

        // 5. Stream sentences and synthesize speech concurrently
        for (let idx = 0; idx < result.sentences.length; idx++) {
          if (session.isCancelled || session.activeGenerationId !== generationId) {
            break;
          }

          const sentence = result.sentences[idx];
          // Try VoiceStudio speech synthesis
          const synth = await voiceService.synthesizeText(sentence, result.language, session.voice);

          if (session.isCancelled || session.activeGenerationId !== generationId) {
            break;
          }

          this.sendJson(ws, {
            type: 'sentence',
            generationId,
            index: idx,
            total: result.sentences.length,
            text: sentence,
            audioBase64: synth?.audioBuffer ? synth.audioBuffer.toString('base64') : null,
            contentType: synth?.contentType || 'audio/mpeg'
          });
        }

        if (session.isCancelled || session.activeGenerationId !== generationId) {
          return;
        }

        // 6. Save assistant response to conversation if active
        if (session.conversationId) {
          conversationService.addMessage(session.conversationId, {
            role: 'assistant',
            content: result.reply,
            speechText: result.speechText,
            language: result.language,
            suggestedSchemes: result.suggestedSchemes,
            modelUsed: result.modelUsed
          });
        }

        // 7. Send done event
        this.sendJson(ws, {
          type: 'done',
          generationId,
          state: 'idle',
          reply: result.reply,
          speechText: result.speechText,
          suggestedSchemes: result.suggestedSchemes
        });
        break;
      }

      default:
        this.sendJson(ws, { type: 'warning', message: `Unknown message type: ${payload.type}` });
    }
  }

  private sendJson(ws: WebSocket, obj: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }
}

export const voiceStreamGateway = new VoiceStreamGateway();
