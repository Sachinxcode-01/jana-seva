export type IndicLanguageCode =
  | 'kn' // Kannada
  | 'en' // English
  | 'hi' // Hindi
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'ur' // Urdu
  | 'pa'; // Punjabi

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male';
  accent: string;
  languageSupport: IndicLanguageCode[];
  description: string;
  isDefault?: boolean;
  engine?: string;
  isDynamic?: boolean;
}

export interface VoiceStudioModel {
  id: string;
  object: string;
  owned_by?: string;
  ready?: boolean;
  type?: 'tts' | 'stt' | 'general';
}

export interface SupportedLanguageInfo {
  code: IndicLanguageCode | string;
  name: string;
  nativeName: string;
  ttsSupported: boolean;
  sttSupported: boolean;
  primaryVoice: string;
}

export interface VoiceStudioHealth {
  online: boolean;
  serviceUrl: string;
  engine?: string;
  version?: string;
  voices?: string[];
  models?: string[];
  supportedLanguages?: string[];
  latencyMs?: number;
  error?: string;
  lastChecked: string;
}

export interface SpeechSynthesisOptions {
  voice?: string;
  language?: string;
  speed?: number; // 0.85 - 1.15 (Default: 0.94 for calm civic delivery)
  responseFormat?: 'mp3' | 'wav' | 'opus' | 'pcm';
  instructions?: string;
  streamFormat?: 'audio' | 'sse';
}

export interface SpeechSynthesisResult {
  audioBuffer: Buffer;
  contentType: string;
  voiceUsed: string;
  durationSeconds?: number;
}

export interface SpeechTranscriptionResult {
  text: string;
  languageDetected?: string;
  confidence?: number;
  durationSeconds?: number;
}

export interface VoiceError {
  code: 'TIMEOUT' | 'UNREACHABLE' | 'INVALID_AUDIO' | 'MODEL_NOT_FOUND' | 'PERMISSION_DENIED' | 'SERVER_ERROR';
  message: string;
  detail?: any;
}
