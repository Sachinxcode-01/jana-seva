import { voiceStudioClient } from './voicestudio.client.js';
import { speechRecognitionService } from './speech-recognition.service.js';
import { speechSynthesisService } from './speech-synthesis.service.js';
import {
  VoiceStudioHealth,
  VoiceProfile,
  SupportedLanguageInfo,
  SpeechSynthesisResult,
  SpeechTranscriptionResult
} from './voice.types.js';

export const SUPPORTED_INDIC_LANGUAGES: SupportedLanguageInfo[] = [
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'en', name: 'Indian English', nativeName: 'English (India)', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', ttsSupported: true, sttSupported: true, primaryVoice: 'kavya-indic' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', ttsSupported: true, sttSupported: true, primaryVoice: 'priya-in' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', ttsSupported: true, sttSupported: true, primaryVoice: 'priya-in' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', ttsSupported: true, sttSupported: true, primaryVoice: 'nova-in' }
];

export class VoiceService {
  public async getHealth(): Promise<VoiceStudioHealth> {
    return voiceStudioClient.getHealth();
  }

  public async getVoiceProfiles(): Promise<VoiceProfile[]> {
    return speechSynthesisService.getAvailableVoiceProfiles();
  }

  public getSupportedLanguages(): SupportedLanguageInfo[] {
    return SUPPORTED_INDIC_LANGUAGES;
  }

  public async transcribeAudio(
    audioBuffer: Buffer,
    languageHint = 'en',
    mimeType = 'audio/webm'
  ): Promise<SpeechTranscriptionResult> {
    return speechRecognitionService.transcribe(audioBuffer, languageHint, mimeType);
  }

  public async synthesizeText(
    text: string,
    language = 'en',
    voice = 'kavya-indic'
  ): Promise<SpeechSynthesisResult | null> {
    return speechSynthesisService.synthesize(text, { language, voice });
  }

  public async synthesizeTextStream(
    text: string,
    language = 'en',
    voice = 'kavya-indic',
    onChunk: (chunk: Buffer) => void
  ): Promise<boolean> {
    return speechSynthesisService.synthesizeStream(text, { language, voice }, onChunk);
  }

  public splitIntoSentences(text: string): string[] {
    return speechSynthesisService.splitIntoSentences(text);
  }
}

export const voiceService = new VoiceService();
