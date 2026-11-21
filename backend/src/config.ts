import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_SECRET = 'janaseva_super_secret_jwt_key_2026_cbp_lab';

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_SECRET)) {
  console.warn('⚠️ [SECURITY WARNING]: Running in production with default/missing JWT_SECRET. Please set a strong random secret in your .env file!');
}

export const CONFIG = {
  PORT: Number(process.env.PORT) || 5000,
  JWT_SECRET: process.env.JWT_SECRET || DEFAULT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // AI Intelligence Engine Provider Settings
  AI_PROVIDER: (process.env.AI_PROVIDER || 'auto') as 'openrouter' | 'openai' | 'offline' | 'auto',
  AI_RESPONSE_LENGTH: (process.env.AI_RESPONSE_LENGTH || 'standard') as 'concise' | 'standard' | 'detailed',
  
  // OpenRouter Configuration
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free',
  
  // OpenAI / Generic OpenAI-Compatible Configuration (Ollama, vLLM, Groq, etc.)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  
  // Local VoiceStudio Engine URL
  VOICESTUDIO_URL: process.env.VOICESTUDIO_URL || 'http://localhost:3900',
};
