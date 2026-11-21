import { aiProviderFactory } from './provider.factory.js';
import { nluService } from './nlu.service.js';
import { responseFormatter } from './response-formatter.js';
import { aiErrorHandler } from './error-handler.js';
import { knowledgeService } from '../knowledge/knowledge.service.js';
import {
  AIRequest,
  AIResponse,
  AIResult,
  ConversationTurn,
  ResponseLength,
  AIProviderType
} from './types.js';
import { IndicLanguageCode } from '../voice/voice.types.js';
import { CONFIG } from '../../config.js';

export interface ProcessMessageOptions {
  language?: string;
  history?: ConversationTurn[];
  responseLength?: ResponseLength;
  providerPreference?: AIProviderType;
}

export class AIService {
  /**
   * Main entrypoint for processing user messages through the AI Intelligence Engine
   */
  public async processMessage(
    rawMessage: string,
    options: ProcessMessageOptions = {}
  ): Promise<AIResult> {
    const query = rawMessage.trim();
    const history = options.history || [];
    const responseLength = options.responseLength || CONFIG.AI_RESPONSE_LENGTH || 'standard';

    // 1. Natural Language Understanding & Context Resolution
    const nlu = nluService.analyze(query, options.language, history);
    const language = nlu.detectedLanguage;

    // 2. Augment follow-up query with active scheme context for RAG retrieval
    let effectiveQuery = query;
    if (nlu.isFollowUp && nlu.activeSchemeContext) {
      effectiveQuery = `${nlu.activeSchemeContext} ${query}`;
    }

    // 3. Grounded Scheme Retrieval via RAG
    const knowledgeResult = knowledgeService.getGroundedContext(effectiveQuery, language, 4);
    const suggestedSchemes = knowledgeResult.schemes.map(s => ({
      id: s.id,
      name: language === 'kn' ? (s.name_kn || s.name) : language === 'hi' ? (s.name_hi || s.name) : s.name,
      category: s.category,
      slug: s.slug,
      officialWebsite: s.officialWebsite
    }));

    // 4. Assemble AI Request
    const aiRequest: AIRequest = {
      prompt: query,
      language,
      history,
      groundingContextText: knowledgeResult.groundingContextText,
      schemes: knowledgeResult.schemes,
      responseLength,
      isFollowUp: nlu.isFollowUp,
      activeScheme: nlu.activeSchemeContext,
      intent: nlu.intent
    };

    // 5. Provider Resolution & Execution with Automatic Fallback
    let aiResponse: AIResponse;
    const primaryProvider = await aiProviderFactory.getPrimaryProvider(options.providerPreference);

    try {
      aiResponse = await primaryProvider.generateResponse(aiRequest);
      if (!aiResponse || !aiResponse.text || !aiResponse.text.trim()) {
        const fallback = aiProviderFactory.getFallbackProvider();
        aiResponse = await fallback.generateResponse(aiRequest);
      }
    } catch (err: any) {
      // Primary provider failed or timed out: fall back gracefully
      aiErrorHandler.handle(err, language);
      const fallback = aiProviderFactory.getFallbackProvider();
      aiResponse = await fallback.generateResponse(aiRequest);
    }

    // 6. Format Response for Display and Speech Delivery
    const cleanReply = responseFormatter.formatForDisplay(aiResponse.text);
    const speechText = responseFormatter.formatForSpeech(cleanReply, language);
    const sentences = responseFormatter.extractSentenceChunks(cleanReply);

    return {
      reply: cleanReply,
      speechText,
      language,
      suggestedSchemes,
      modelUsed: aiResponse.modelUsed,
      providerName: aiResponse.providerName,
      sentences,
      nlu
    };
  }

  /**
   * Real-time streaming token generation for SSE or WebSocket consumers
   */
  public async streamMessage(
    rawMessage: string,
    options: ProcessMessageOptions = {},
    onToken: (token: string) => void
  ): Promise<AIResult> {
    const query = rawMessage.trim();
    const history = options.history || [];
    const responseLength = options.responseLength || CONFIG.AI_RESPONSE_LENGTH || 'standard';

    const nlu = nluService.analyze(query, options.language, history);
    const language = nlu.detectedLanguage;

    let effectiveQuery = query;
    if (nlu.isFollowUp && nlu.activeSchemeContext) {
      effectiveQuery = `${nlu.activeSchemeContext} ${query}`;
    }

    const knowledgeResult = knowledgeService.getGroundedContext(effectiveQuery, language, 4);
    const suggestedSchemes = knowledgeResult.schemes.map(s => ({
      id: s.id,
      name: language === 'kn' ? (s.name_kn || s.name) : language === 'hi' ? (s.name_hi || s.name) : s.name,
      category: s.category,
      slug: s.slug,
      officialWebsite: s.officialWebsite
    }));

    const aiRequest: AIRequest = {
      prompt: query,
      language,
      history,
      groundingContextText: knowledgeResult.groundingContextText,
      schemes: knowledgeResult.schemes,
      responseLength,
      isFollowUp: nlu.isFollowUp,
      activeScheme: nlu.activeSchemeContext,
      intent: nlu.intent,
      stream: true
    };

    let aiResponse: AIResponse;
    const primaryProvider = await aiProviderFactory.getPrimaryProvider(options.providerPreference);

    try {
      aiResponse = await primaryProvider.streamResponse(aiRequest, onToken);
      if (!aiResponse || !aiResponse.text || !aiResponse.text.trim()) {
        const fallback = aiProviderFactory.getFallbackProvider();
        aiResponse = await fallback.streamResponse(aiRequest, onToken);
      }
    } catch (err: any) {
      aiErrorHandler.handle(err, language);
      const fallback = aiProviderFactory.getFallbackProvider();
      aiResponse = await fallback.streamResponse(aiRequest, onToken);
    }

    const cleanReply = responseFormatter.formatForDisplay(aiResponse.text);
    const speechText = responseFormatter.formatForSpeech(cleanReply, language);
    const sentences = responseFormatter.extractSentenceChunks(cleanReply);

    return {
      reply: cleanReply,
      speechText,
      language,
      suggestedSchemes,
      modelUsed: aiResponse.modelUsed,
      providerName: aiResponse.providerName,
      sentences,
      nlu
    };
  }
}

export const aiService = new AIService();
