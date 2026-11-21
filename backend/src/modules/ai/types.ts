import { IndicLanguageCode } from '../voice/voice.types.js';
import { Scheme } from '../../types.js';

export type AIProviderType = 'openrouter' | 'openai' | 'offline' | 'auto';

export type ResponseLength = 'concise' | 'standard' | 'detailed';

export type IntentType =
  | 'SCHEME_OVERVIEW'
  | 'ELIGIBILITY_CRITERIA'
  | 'REQUIRED_DOCUMENTS'
  | 'APPLICATION_PROCEDURE'
  | 'BENEFITS_INQUIRY'
  | 'DEADLINE_INQUIRY'
  | 'GREETING'
  | 'FRAUD_REPORT'
  | 'UNKNOWN';

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface NluAnalysis {
  intent: IntentType;
  confidence: number;
  identifiedSchemeSlug?: string;
  identifiedSchemeName?: string;
  isFollowUp: boolean;
  activeSchemeContext?: string;
  detectedLanguage: IndicLanguageCode;
  entities: {
    targetCriteria?: string;
    age?: number;
    gender?: string;
    occupation?: string;
    income?: number;
    residence?: string;
    mentionedPortal?: string;
  };
}

export interface AIRequest {
  prompt: string;
  language: IndicLanguageCode;
  history?: ConversationTurn[];
  groundingContextText?: string;
  schemes?: Scheme[];
  responseLength?: ResponseLength;
  isFollowUp?: boolean;
  activeScheme?: string;
  intent?: IntentType;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  modelUsed: string;
  providerName: string;
  confidence: number;
  tokensUsed?: number;
  error?: string;
  isFallback?: boolean;
}

export interface AIResult {
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
  providerName: string;
  sentences: string[];
  nlu: NluAnalysis;
}
