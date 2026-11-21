import { AIRequest, AIResponse } from '../types.js';

export interface IAIProvider {
  /**
   * Generates a complete response for the given request
   */
  generateResponse(request: AIRequest): Promise<AIResponse>;

  /**
   * Streams response tokens as they arrive from the model provider
   */
  streamResponse(
    request: AIRequest,
    onChunk: (token: string) => void
  ): Promise<AIResponse>;

  /**
   * Checks whether this provider is currently configured and healthy
   */
  isAvailable(): Promise<boolean>;

  /**
   * Returns human-readable provider identifier (e.g., 'OpenRouter', 'OpenAI', 'Offline Grounded Engine')
   */
  getProviderName(): string;
}
