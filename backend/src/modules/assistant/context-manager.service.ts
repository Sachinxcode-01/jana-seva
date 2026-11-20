import { IndicLanguageCode } from '../voice/voice.types.js';

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ContextManagerService {
  /**
   * Detects language from unicode script, vernacular vocabulary, or phonetic transliteration
   */
  public detectLanguage(text: string): IndicLanguageCode {
    if (!text) return 'en';

    // 1. Unicode script detection (100% accurate for native Indic scripts)
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
    if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Urdu

    // Devanagari script: could be Hindi or Marathi
    if (/[\u0900-\u097F]/.test(text)) {
      if (/\b(आहे|आहेत|नाही|कसा|कशी|योजना|माहिती|अर्ज|शासकीय|कागदपत्रे|पात्रता)\b/.test(text)) {
        return 'mr'; // Marathi
      }
      return 'hi'; // Hindi
    }

    // 2. Romanized transliterations and code-switching markers
    const lower = text.toLowerCase();

    // Kannada transliteration / code-switching (e.g. "yaru eligible", "hege apply madodu", "beku")
    if (/\b(kannada|namaskara|hegidira|yavaga|beku|yaru|madodu|enu|yojana|yojane|sulabhagi|kodu)\b/.test(lower)) {
      return 'kn';
    }
    // Hindi transliteration (e.g. "kaise milega", "kisko", "kya documents chahiye")
    if (/\b(hindi|namaste|bataiye|kaise|kisko|chahiye|yojana|paisa|milega|dastavej|shukriya)\b/.test(lower)) {
      return 'hi';
    }
    // Telugu transliteration
    if (/\b(telugu|namaskaram|cheppandi|ela|unnavu|darakhasthu|arhatha)\b/.test(lower)) {
      return 'te';
    }
    // Tamil transliteration
    if (/\b(tamil|vanakkam|sollunga|eppadi|irukinga|thittam|thavaigal)\b/.test(lower)) {
      return 'ta';
    }
    // Malayalam transliteration
    if (/\b(malayalam|namaskaram|enthoke|vishesham|enthanu|paddhathi)\b/.test(lower)) {
      return 'ml';
    }
    // Marathi transliteration
    if (/\b(marathi|namaskar|kasa|kay|sang|mahiti|arja)\b/.test(lower)) {
      return 'mr';
    }
    // Bengali transliteration
    if (/\b(bengali|bangla|nomoshkar|kemon|achen|prokolpo)\b/.test(lower)) {
      return 'bn';
    }
    // Gujarati transliteration
    if (/\b(gujarati|kem|cho|majama|yojna|mahiti)\b/.test(lower)) {
      return 'gu';
    }

    return 'en';
  }

  /**
   * Resolves language preference with explicit hint override and code-switch detection
   */
  public resolveLanguage(query: string, languageHint?: string): IndicLanguageCode {
    const detected = this.detectLanguage(query);
    if (detected !== 'en') {
      return detected;
    }
    if (languageHint && ['kn', 'en', 'hi', 'te', 'ta', 'ml', 'mr', 'bn', 'gu', 'ur', 'pa'].includes(languageHint)) {
      return languageHint as IndicLanguageCode;
    }
    return 'en';
  }

  /**
   * Inspects conversation history to identify the active subject scheme in multi-turn dialogues
   * Example: Citizen asks "Tell me about Gruha Lakshmi", followed by "Who is eligible?"
   */
  public extractActiveSchemeContext(history: ConversationTurn[]): string | null {
    if (!history || history.length === 0) return null;

    // Scan backwards from most recent messages
    const schemePatterns = [
      /\b(gruha\s+lakshmi|griha\s+lakshmi|ಗೃಹ\s+ಲಕ್ಷ್ಮಿ|गृह\s+लक्ष्मी)\b/i,
      /\b(shakti|shakthi|ಶಕ್ತಿ|शक्ति)\b/i,
      /\b(pm\s*[-]?\s*kisan|ಪಿಎಂ\s+ಕಿಸಾನ್|पीएम\s+किसान)\b/i,
      /\b(ssp\s+scholarship|ssp|ಎಸ್‌ಎಸ್‌ಪಿ|एसएसपी)\b/i,
      /\b(yuva\s+nidhi|ಯುವ\s+ನಿಧಿ|युवा\s+निधि)\b/i,
      /\b(anna\s+bhagya|ಅನ್ನ\s+ಭಾಗ್ಯ|अन्न\s+भाग्य)\b/i,
      /\b(gruha\s+jyoti|gruha\s+jyothi|ಗೃಹ\s+ಜ್ಯೋತಿ|गृह\s+ज्योति)\b/i,
      /\b(ayushman\s+bharat|pmjay|ಆಯುಷ್ಮಾನ್\s+ಭಾರತ್|आयुष्मान\s+भारत)\b/i,
      /\b(mudra|ಮುದ್ರಾ|मुद्रा)\b/i,
      /\b(svanidhi|ಸ್ವನಿಧಿ|स्वनिधि)\b/i
    ];

    for (let i = history.length - 1; i >= 0; i--) {
      const text = history[i].content;
      for (const pat of schemePatterns) {
        const match = text.match(pat);
        if (match) {
          return match[0].toLowerCase();
        }
      }
    }
    return null;
  }
}

export const contextManagerService = new ContextManagerService();
