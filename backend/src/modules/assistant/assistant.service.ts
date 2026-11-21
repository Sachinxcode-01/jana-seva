import { aiService } from '../ai/ai.service.js';
import { IndicLanguageCode } from '../voice/voice.types.js';
import { ConversationTurn } from './context-manager.service.js';
import { ResponseLength } from '../ai/types.js';

export interface AssistantQueryResult {
  reply: string;
  speechText: string;
  language: IndicLanguageCode;
  suggestedSchemes: Array<{
    id: string;
    name: string;
    category: string;
    slug: string;
    officialWebsite: string;
  }>;
  modelUsed: string;
  sentences: string[];
}

export class AssistantService {
  /**
   * Main entrypoint for processing user messages through the AI Intelligence Engine
   */
  public async processQuery(
    rawMessage: string,
    languageHint?: string,
    history: ConversationTurn[] = [],
    responseLength?: ResponseLength
  ): Promise<AssistantQueryResult> {
    const result = await aiService.processMessage(rawMessage, {
      language: languageHint,
      history,
      responseLength
    });

    return {
      reply: result.reply,
      speechText: result.speechText,
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed,
      sentences: result.sentences
    };
  }

  /**
   * Streaming entrypoint for real-time token delivery (SSE or WebSocket)
   */
  public async streamQuery(
    rawMessage: string,
    languageHint?: string,
    history: ConversationTurn[] = [],
    onToken?: (token: string) => void,
    responseLength?: ResponseLength
  ): Promise<AssistantQueryResult> {
    const result = await aiService.streamMessage(rawMessage, {
      language: languageHint,
      history,
      responseLength
    }, onToken || (() => { }));

    return {
      reply: result.reply,
      speechText: result.speechText,
      language: result.language,
      suggestedSchemes: result.suggestedSchemes,
      modelUsed: result.modelUsed,
      sentences: result.sentences
    };
  }
}

export const assistantService = new AssistantService();
