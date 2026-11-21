import { IndicLanguageCode } from '../voice/voice.types.js';
import { IntentType, NluAnalysis, ConversationTurn } from './types.js';

// Colloquial and phonetic scheme aliases mapping to canonical slugs
const KNOWN_SCHEME_ALIASES: Record<string, string[]> = {
  'pm-kisan-samman-nidhi': [
    'pm kisan', 'pm-kisan', 'kisan samman', 'farmer 6000', 'kisan 6000', 'raitha 6000',
    'ಪಿಎಂ ಕಿಸಾನ್', 'ಕಿಸಾನ್ ಸಮ್ಮಾನ್', 'पीएम किसान', 'किसान सम्मान'
  ],
  'gruha-lakshmi-yojana': [
    'gruha lakshmi', 'griha lakshmi', 'gruhalakshmi', 'grihalakshmi', 'women 2000', '2000 scheme',
    'ಗೃಹ ಲಕ್ಷ್ಮಿ', 'ಗೃಹಲಕ್ಷ್ಮಿ', 'गृह लक्ष्मी', 'गृहलक्ष्मी', '2000 rupees'
  ],
  'shakti-scheme-karnataka': [
    'shakti', 'shakthi', 'free bus', 'shakti bus', 'women bus pass', 'free travel',
    'ಶಕ್ತಿ ಯೋಜನೆ', 'ಶಕ್ತಿ ಬಸ್', 'शक्ति योजना', 'शक्ति बस'
  ],
  'ssp-post-matric-scholarship': [
    'ssp', 'ssp scholarship', 'post matric', 'state scholarship portal', 'fee concession',
    'ಎಸ್‌ಎಸ್‌ಪಿ', 'ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ', 'एसएसपी', 'छात्रवृत्ति'
  ],
  'yuva-nidhi-scheme': [
    'yuva nidhi', 'yuvanidhi', 'unemployment allowance', 'graduate allowance',
    'ಯುವ ನಿಧಿ', 'ಯುವನಿಧಿ', 'युवा निधि', 'युवानिधि'
  ],
  'anna-bhagya-scheme': [
    'anna bhagya', 'annabhagya', 'free rice', 'dbt rice', 'bpl rice',
    'ಅನ್ನ ಭಾಗ್ಯ', 'ಅನ್ನಭಾಗ್ಯ', 'अन्न भाग्य', 'अन्नभाग्य'
  ],
  'gruha-jyothi-scheme': [
    'gruha jyoti', 'gruha jyothi', 'free electricity', '200 units', 'free power',
    'ಗೃಹ ಜ್ಯೋತಿ', 'ಗೃಹಜ್ಯೋತಿ', 'गृह ज्योति', 'गृहज्योति'
  ],
  'ayushman-bharat-pmjay': [
    'ayushman', 'pmjay', 'golden card', 'health card 5 lakh', 'arogya karnataka',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್', 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ', 'आयुष्मान भारत', 'गोल्डन कार्ड'
  ]
};

export class NluService {
  /**
   * Performs end-to-end natural language understanding on incoming query
   */
  public analyze(
    rawQuery: string,
    languageHint?: string,
    history: ConversationTurn[] = []
  ): NluAnalysis {
    const query = rawQuery.trim();
    const detectedLanguage = this.detectLanguage(query, languageHint);
    const intent = this.classifyIntent(query);
    const isFollowUp = this.isFollowUpQuery(query);
    const activeSchemeContext = isFollowUp ? this.extractActiveScheme(history) : undefined;
    const directScheme = this.extractSchemeFromQuery(query);
    const entities = this.extractEntities(query);

    return {
      intent,
      confidence: directScheme || activeSchemeContext ? 0.95 : 0.8,
      identifiedSchemeSlug: directScheme || activeSchemeContext,
      isFollowUp,
      activeSchemeContext,
      detectedLanguage,
      entities
    };
  }

  /**
   * Resolves language from unicode ranges and transliterated romanized keywords
   */
  public detectLanguage(query: string, hint?: string): IndicLanguageCode {
    if (!query) return (hint as IndicLanguageCode) || 'en';

    // 1. Check Unicode character ranges
    if (/[\u0C80-\u0CFF]/.test(query)) return 'kn'; // Kannada Unicode
    if (/[\u0900-\u097F]/.test(query)) return 'hi'; // Devanagari (Hindi)
    if (/[\u0C00-\u0C7F]/.test(query)) return 'te'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(query)) return 'ta'; // Tamil
    if (/[\u0D00-\u0D7F]/.test(query)) return 'ml'; // Malayalam
    if (/[\u0980-\u09FF]/.test(query)) return 'bn'; // Bengali
    if (/[\u0A80-\u0AFF]/.test(query)) return 'gu'; // Gujarati

    // 2. Check transliterated Romanized Indic words
    const lower = query.toLowerCase();
    const kannadaTranslit = ['enu', 'beku', 'yarige', 'hege', 'arজি', 'yojana', 'yojane', 'namaskara', 'gotilla', 'yavudu', 'sarkari'];
    if (kannadaTranslit.some(w => lower.includes(w))) return 'kn';

    const hindiTranslit = ['kaise', 'kya', 'patra', 'yojana', 'dastavej', 'namaste', 'batao', 'karen', 'shuru', 'chahiye', 'milenge'];
    if (hindiTranslit.some(w => lower.includes(w))) return 'hi';

    if (hint && ['kn', 'hi', 'te', 'ta', 'ml', 'mr', 'bn', 'gu', 'en'].includes(hint)) {
      return hint as IndicLanguageCode;
    }

    return 'en';
  }

  /**
   * Classifies user intent from vocabulary and grammatical patterns
   */
  public classifyIntent(query: string): IntentType {
    const lower = query.toLowerCase();

    // Greeting
    if (this.isGreeting(lower)) return 'GREETING';

    // Eligibility
    if (
      lower.includes('who is eligible') || lower.includes('eligibility') ||
      lower.includes('age limit') || lower.includes('income limit') ||
      lower.includes('qualify') || lower.includes('can i apply') ||
      lower.includes('ಯಾರು ಅರ್ಹರು') || lower.includes('ಅರ್ಹತೆ') ||
      lower.includes('पात्रता') || lower.includes('पात्र कौन')
    ) {
      return 'ELIGIBILITY_CRITERIA';
    }

    // Required Documents
    if (
      lower.includes('document') || lower.includes('proof') || lower.includes('papers') ||
      lower.includes('certificate') || lower.includes('ration card') || lower.includes('aadhaar') ||
      lower.includes('ದಾಖಲೆ') || lower.includes('ದಸ್ತಾವೇಜು') ||
      lower.includes('दस्तावेज') || lower.includes('कागजात')
    ) {
      return 'REQUIRED_DOCUMENTS';
    }

    // Application Procedure
    if (
      lower.includes('how to apply') || lower.includes('procedure') || lower.includes('steps') ||
      lower.includes('where to apply') || lower.includes('online application') || lower.includes('portal') ||
      lower.includes('ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ') || lower.includes('ಅರ್ಜಿ ವಿಧಾನ') ||
      lower.includes('आवेदन कैसे करें') || lower.includes('प्रक्रिया')
    ) {
      return 'APPLICATION_PROCEDURE';
    }

    // Benefits & Financial Aid
    if (
      lower.includes('benefit') || lower.includes('how much') || lower.includes('money') ||
      lower.includes('amount') || lower.includes('subsidy') || lower.includes('installment') ||
      lower.includes('ಪ್ರಯೋಜನ') || lower.includes('ಎಷ್ಟು ಹಣ') ||
      lower.includes('लाभ') || lower.includes('कितना पैसा') || lower.includes('राशि')
    ) {
      return 'BENEFITS_INQUIRY';
    }

    // Deadline / Last Date
    if (
      lower.includes('last date') || lower.includes('deadline') || lower.includes('due date') ||
      lower.includes('ಕೊನೆಯ ದಿನಾಂಕ') || lower.includes('ಅಂತಿಮ ದಿನಾಂಕ') ||
      lower.includes('अंतिम तिथि') || lower.includes('लास्ट डेट')
    ) {
      return 'DEADLINE_INQUIRY';
    }

    // Scheme Overview
    for (const aliases of Object.values(KNOWN_SCHEME_ALIASES)) {
      if (aliases.some(alias => lower.includes(alias.toLowerCase()))) {
        return 'SCHEME_OVERVIEW';
      }
    }

    return 'UNKNOWN';
  }

  /**
   * Determines if a query is an elliptic follow-up (e.g. "Who is eligible?", "What are the documents?")
   */
  public isFollowUpQuery(query: string): boolean {
    const lower = query.toLowerCase().trim();
    const wordCount = lower.split(/\s+/).length;

    // Follow-ups are short questions lacking a concrete scheme subject
    if (wordCount > 7) return false;

    // If query directly mentions a specific scheme, it is an independent inquiry
    for (const aliases of Object.values(KNOWN_SCHEME_ALIASES)) {
      if (aliases.some(a => lower.includes(a.toLowerCase()))) {
        return false;
      }
    }

    const followUpPatterns = [
      'who is eligible', 'who can apply', 'is it eligible', 'what documents', 'what are the documents',
      'how to apply', 'where to apply', 'what is the benefit', 'how much money', 'last date',
      'deadline', 'documents needed', 'eligibility criteria',
      'ಯಾರು ಅರ್ಹರು', 'ದಾಖಲೆಗಳು ಯಾವುವು', 'ಅರ್ಜಿ ಹೇಗೆ ಸಲ್ಲಿಸುವುದು', 'ಎಷ್ಟು ಹಣ ಬರುತ್ತದೆ',
      'पात्रता क्या है', 'दस्तावेज क्या हैं', 'आवेदन कैसे करें', 'कितना पैसा मिलेगा'
    ];

    return followUpPatterns.some(p => lower.includes(p));
  }

  /**
   * Extracts the active scheme slug being discussed in prior turns of conversation history
   */
  public extractActiveScheme(history: ConversationTurn[]): string | undefined {
    if (!history || history.length === 0) return undefined;

    // Scan backwards from most recent message
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      const text = turn.content.toLowerCase();

      for (const [slug, aliases] of Object.entries(KNOWN_SCHEME_ALIASES)) {
        if (aliases.some(a => text.includes(a.toLowerCase()))) {
          return slug;
        }
      }
    }
    return undefined;
  }

  private extractSchemeFromQuery(query: string): string | undefined {
    const lower = query.toLowerCase();
    for (const [slug, aliases] of Object.entries(KNOWN_SCHEME_ALIASES)) {
      if (aliases.some(a => lower.includes(a.toLowerCase()))) {
        return slug;
      }
    }
    return undefined;
  }

  private extractEntities(query: string): Record<string, any> {
    const lower = query.toLowerCase();
    const entities: Record<string, any> = {};

    // Age extraction
    const ageMatch = query.match(/\b(\d{1,2})\s*(?:years|years old|ವರ್ಷ|साल)\b/i);
    if (ageMatch) entities.age = parseInt(ageMatch[1], 10);

    // Occupation
    if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('ರೈತ') || lower.includes('किसान')) {
      entities.occupation = 'farmer';
    } else if (lower.includes('student') || lower.includes('college') || lower.includes('ವಿದ್ಯಾರ್ಥಿ') || lower.includes('छात्र')) {
      entities.occupation = 'student';
    } else if (lower.includes('women') || lower.includes('female') || lower.includes('mother') || lower.includes('ಮಹಿಳೆ') || lower.includes('महिला')) {
      entities.occupation = 'woman';
    }

    // Portal
    if (lower.includes('seva sindhu') || lower.includes('ಸೇವಾ ಸಿಂಧು')) entities.mentionedPortal = 'Seva Sindhu';
    if (lower.includes('pmkisan') || lower.includes('pm-kisan')) entities.mentionedPortal = 'PM-KISAN';
    if (lower.includes('ssp') || lower.includes('ಎಸ್ಎಸ್ಪಿ')) entities.mentionedPortal = 'State Scholarship Portal';

    return entities;
  }

  private isGreeting(query: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'namaste', 'namaskara', 'ನಮಸ್ಕಾರ', 'ಹಲೋ', 'नमस्ते', 'प्रणाम'];
    const words = query.trim().split(/\s+/);
    return words.length <= 3 && greetings.some(g => query.includes(g));
  }
}

export const nluService = new NluService();
