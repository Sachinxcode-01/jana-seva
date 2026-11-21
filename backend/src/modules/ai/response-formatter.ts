import { IndicLanguageCode } from '../voice/voice.types.js';

export class ResponseFormatter {
  /**
   * Formats text for clean, visually engaging on-screen UI presentation
   */
  public formatForDisplay(rawText: string): string {
    if (!rawText) return '';

    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Formats text for high-clarity speech synthesis (TTS)
   * Expands currency symbols, numbers, and abbreviations into natural spoken phonetic forms
   */
  public formatForSpeech(text: string, language: IndicLanguageCode = 'en'): string {
    if (!text) return '';

    let clean = text
      // 1. Remove URLs entirely from spoken audio
      .replace(/https?:\/\/\S+/g, '')
      // 2. Extract markdown link anchor text: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 3. Remove markdown bold, italic, code marks
      .replace(/[*#_`~]/g, '')
      // 4. Clean bullet markers
      .replace(/^[•\-*]\s+/gm, '')
      // 5. Replace multiple newlines with a period for natural breathing pause
      .replace(/\n+/g, '. ');

    // 6. Phonetic Currency expansions
    if (language === 'kn') {
      clean = clean
        .replace(/₹\s*([0-9,]+)/g, '$1 ರೂಪಾಯಿಗಳು')
        .replace(/Rs\.?\s*([0-9,]+)/gi, '$1 ರೂಪಾಯಿಗಳು');
    } else if (language === 'hi') {
      clean = clean
        .replace(/₹\s*([0-9,]+)/g, '$1 रुपये')
        .replace(/Rs\.?\s*([0-9,]+)/gi, '$1 रुपये');
    } else {
      clean = clean
        .replace(/₹\s*([0-9,]+)/g, '$1 rupees')
        .replace(/Rs\.?\s*([0-9,]+)/gi, '$1 rupees');
    }

    // 7. Phonetic Acronym expansions
    clean = clean
      .replace(/\bPM-KISAN\b/g, 'P M Kisan')
      .replace(/\bSSP\b/g, 'S S P')
      .replace(/\bBPL\b/g, 'B P L')
      .replace(/\bAPL\b/g, 'A P L')
      .replace(/\bRTC\b/g, 'R T C')
      .replace(/\bDBT\b/g, 'Direct Benefit Transfer')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return clean;
  }

  /**
   * Splits a long text response into sentence chunks for sentence-level streaming playback
   */
  public extractSentenceChunks(text: string): string[] {
    if (!text || text.trim().length === 0) return [];

    const clean = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // Split on sentence boundaries including Indic danda (।)
    const sentenceRegex = /[^.!?।\n]+[.!?।\n]+/g;
    const matches = clean.match(sentenceRegex);

    if (!matches || matches.length === 0) {
      return [clean];
    }

    const sentences: string[] = [];
    let buffer = '';

    for (const raw of matches) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      buffer += (buffer ? ' ' : '') + trimmed;
      if (buffer.length >= 30 || trimmed.endsWith('?') || trimmed.endsWith('!')) {
        sentences.push(buffer);
        buffer = '';
      }
    }

    if (buffer.trim()) {
      sentences.push(buffer.trim());
    }

    return sentences.filter(s => s.length > 0);
  }
}

export const responseFormatter = new ResponseFormatter();
