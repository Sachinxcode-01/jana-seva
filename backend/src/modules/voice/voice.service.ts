import { voiceStudioClient } from './voicestudio.client.js';
import { speechRecognitionService } from './speech-recognition.service.js';
import { speechSynthesisService } from './speech-synthesis.service.js';
import {
  VoiceStudioHealth,
  VoiceProfile,
  SpeechSynthesisResult,
  SpeechTranscriptionResult
} from './voice.types.js';

export class VoiceService {
  public async getHealth(): Promise<VoiceStudioHealth> {
    return voiceStudioClient.getHealth();
  }

  public getVoiceProfiles(): VoiceProfile[] {
    return speechSynthesisService.getAvailableVoiceProfiles();
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

  public splitIntoSentences(text: string): string[] {
    return speechSynthesisService.splitIntoSentences(text);
  }
}

export const voiceService = new VoiceService();
