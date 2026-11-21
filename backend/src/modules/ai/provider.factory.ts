import { IAIProvider } from './providers/ai-provider.interface.js';
import { OpenRouterProvider } from './providers/openrouter.provider.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.provider.js';
import { OfflineDeterministicProvider } from './providers/offline-deterministic.provider.js';
import { AIProviderType } from './types.js';
import { CONFIG } from '../../config.js';

export class AIProviderFactory {
  private openRouterProvider: OpenRouterProvider;
  private openAIProvider: OpenAICompatibleProvider;
  private offlineProvider: OfflineDeterministicProvider;

  constructor() {
    this.openRouterProvider = new OpenRouterProvider();
    this.openAIProvider = new OpenAICompatibleProvider();
    this.offlineProvider = new OfflineDeterministicProvider();
  }

  /**
   * Resolves the primary active provider based on configuration and availability
   */
  public async getPrimaryProvider(preference?: AIProviderType): Promise<IAIProvider> {
    const mode = preference || CONFIG.AI_PROVIDER || 'auto';

    switch (mode) {
      case 'openrouter': {
        const ok = await this.openRouterProvider.isAvailable();
        return ok ? this.openRouterProvider : this.offlineProvider;
      }

      case 'openai': {
        const ok = await this.openAIProvider.isAvailable();
        return ok ? this.openAIProvider : this.offlineProvider;
      }

      case 'offline': {
        return this.offlineProvider;
      }

      case 'auto':
      default: {
        // Priority 1: OpenRouter (if key configured)
        if (await this.openRouterProvider.isAvailable()) {
          return this.openRouterProvider;
        }

        // Priority 2: OpenAI / generic compatible (if configured)
        if (await this.openAIProvider.isAvailable()) {
          return this.openAIProvider;
        }

        // Priority 3: Guaranteed offline deterministic engine
        return this.offlineProvider;
      }
    }
  }

  /**
   * Returns guaranteed offline deterministic fallback provider
   */
  public getFallbackProvider(): IAIProvider {
    return this.offlineProvider;
  }

  /**
   * Diagnostic method returning status of all registered providers
   */
  public async getProvidersStatus(): Promise<Array<{ id: string; name: string; available: boolean }>> {
    return [
      {
        id: 'openrouter',
        name: this.openRouterProvider.getProviderName(),
        available: await this.openRouterProvider.isAvailable()
      },
      {
        id: 'openai',
        name: this.openAIProvider.getProviderName(),
        available: await this.openAIProvider.isAvailable()
      },
      {
        id: 'offline',
        name: this.offlineProvider.getProviderName(),
        available: true
      }
    ];
  }
}

export const aiProviderFactory = new AIProviderFactory();
