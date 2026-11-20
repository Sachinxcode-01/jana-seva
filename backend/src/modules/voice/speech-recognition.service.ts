import { voiceStudioClient } from './voicestudio.client.js';
import { SpeechTranscriptionResult } from './voice.types.js';

export class SpeechRecognitionService {
  /**
   * Phonetic correction dictionary for Indian civic, scheme, and welfare terminology
   */
  public normalizeSpeechQuery(query: string): string {
    let cleaned = query.trim();
    const rules: [RegExp, string][] = [
      [/\bgrammar\s+panchayat\b/gi, 'Gram Panchayat'],
      [/\bgram\s+panchayath\b/gi, 'Gram Panchayat'],
      [/\bpanchyaksham\b/gi, 'Panchayat'],
      [/\bpanchayath\b/gi, 'Panchayat'],
      [/\bgruha\s+laxmi\b/gi, 'Gruha Lakshmi'],
      [/\bgriha\s+lakshmi\b/gi, 'Gruha Lakshmi'],
      [/\bgriha\s+laxmi\b/gi, 'Gruha Lakshmi'],
      [/\bgruhalakshmi\b/gi, 'Gruha Lakshmi'],
      [/\bgrihalakshmi\b/gi, 'Gruha Lakshmi'],
      [/\baayushman\b/gi, 'Ayushman Bharat'],
      [/\bayushman\s+card\b/gi, 'Ayushman Bharat Card'],
      [/\bayushman(?!\s+bharat)\b/gi, 'Ayushman Bharat'],
      [/\bpm\s+kissan\b/gi, 'PM-KISAN'],
      [/\bpmkisan\b/gi, 'PM-KISAN'],
      [/\bpm\s+kisan\s+yojana\b/gi, 'PM-KISAN'],
      [/\bshakti\s+scheme\s+bus\b/gi, 'Shakti Scheme'],
      [/\bshakthi\s+scheme\b/gi, 'Shakti Scheme'],
      [/\bshakthi\s+bus\b/gi, 'Shakti Scheme'],
      [/\bssp\s+scholarship\s+portal\b/gi, 'SSP Scholarship'],
      [/\bssp\s+post\s+matric\b/gi, 'SSP Post-Matric Scholarship'],
      [/\bssp\s+pre\s+matric\b/gi, 'SSP Pre-Matric Scholarship'],
      [/\byuvanidhi\b/gi, 'Yuva Nidhi'],
      [/\byuva\s+nidhi\s+yojana\b/gi, 'Yuva Nidhi'],
      [/\bannabhagya\b/gi, 'Anna Bhagya'],
      [/\banna\s+bhagya\s+rice\b/gi, 'Anna Bhagya'],
      [/\bgruha\s+jyothi\b/gi, 'Gruha Jyoti'],
      [/\bgriha\s+jyoti\b/gi, 'Gruha Jyoti'],
      [/\bgruhajyothi\b/gi, 'Gruha Jyoti'],
      [/\bration\s+card\s+bpl\b/gi, 'BPL Ration Card'],
      [/\baadhar\b/gi, 'Aadhaar'],
      [/\badhar\b/gi, 'Aadhaar'],
      [/\bbhoomi\s+rtc\b/gi, 'Bhoomi RTC'],
      [/\bseva\s+sindhu\b/gi, 'Seva Sindhu'],
      [/\bsevasindhu\b/gi, 'Seva Sindhu'],
      [/\bgrama\s+one\b/gi, 'Grama One'],
      [/\bkarnataka\s+one\b/gi, 'Karnataka One']
    ];

    for (const [pattern, replacement] of rules) {
      cleaned = cleaned.replace(pattern, replacement);
    }
    return cleaned;
  }

  /**
   * Transcribe speech buffer using VoiceStudio Whisper STT with fallback
   */
  public async transcribe(
    audioBuffer: Buffer,
    languageHint = 'en',
    mimeType = 'audio/webm'
  ): Promise<SpeechTranscriptionResult> {
    const rawResult = await voiceStudioClient.transcribeSpeech(audioBuffer, languageHint, mimeType);
    if (!rawResult || !rawResult.text) {
      return {
        text: '',
        languageDetected: languageHint,
        confidence: 0
      };
    }

    const normalized = this.normalizeSpeechQuery(rawResult.text);
    return {
      text: normalized,
      languageDetected: rawResult.languageDetected || languageHint,
      confidence: 0.95
    };
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
