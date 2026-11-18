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
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-lightning:free',
  VOICESTUDIO_URL: process.env.VOICESTUDIO_URL || 'http://localhost:3900',
};
