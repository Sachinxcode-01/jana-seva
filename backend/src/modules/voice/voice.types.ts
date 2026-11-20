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
}

export interface VoiceStudioModel {
  id: string;
  object: string;
  owned_by?: string;
  ready?: boolean;
}

export interface VoiceStudioHealth {
  online: boolean;
  serviceUrl: string;
  engine?: string;
  version?: string;
  voices?: string[];
  models?: string[];
  error?: string;
  lastChecked: string;
}

export interface SpeechSynthesisOptions {
  voice?: string;
  language?: string;
  speed?: number; // 0.85 - 1.15
  responseFormat?: 'mp3' | 'wav' | 'opus';
  instructions?: string;
}

export interface SpeechSynthesisResult {
  audioBuffer: Buffer;
  contentType: string;
  durationSeconds?: number;
}

export interface SpeechTranscriptionResult {
  text: string;
  languageDetected?: string;
  confidence?: number;
}
