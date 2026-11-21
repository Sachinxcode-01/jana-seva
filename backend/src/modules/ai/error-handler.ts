import { IndicLanguageCode } from '../voice/voice.types.js';

export type AIErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'CONTENT_FILTER'
  | 'UNKNOWN';

export interface HandledError {
  code: AIErrorCode;
  userMessage: string;
  technicalMessage: string;
}

export class AIErrorHandler {
  /**
   * Classifies an unhandled exception into a structured, citizen-friendly error
   */
  public handle(error: any, language: IndicLanguageCode = 'en'): HandledError {
    const message = error?.message || String(error);
    const code = this.classify(message);
    const userMessage = this.getUserMessage(code, language);

    console.warn(`[AI Engine] Error (${code}): ${message}`);

    return {
      code,
      userMessage,
      technicalMessage: message
    };
  }

  private classify(message: string): AIErrorCode {
    const lower = message.toLowerCase();
    if (lower.includes('timed out') || lower.includes('timeout')) return 'TIMEOUT';
    if (lower.includes('rate limit') || lower.includes('429')) return 'RATE_LIMIT';
    if (lower.includes('401') || lower.includes('403') || lower.includes('unauthorized') || lower.includes('api key')) return 'AUTH_ERROR';
    if (lower.includes('enotfound') || lower.includes('econnrefused') || lower.includes('network')) return 'NETWORK_ERROR';
    if (lower.includes('safety') || lower.includes('moderation') || lower.includes('filter')) return 'CONTENT_FILTER';
    return 'UNKNOWN';
  }

  private getUserMessage(code: AIErrorCode, language: IndicLanguageCode): string {
    switch (language) {
      case 'kn':
        switch (code) {
          case 'TIMEOUT':
            return 'ಸಂಪರ್ಕ ವಿಳಂಬವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಸೇವಾ ಸಿಂಧು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.';
          case 'RATE_LIMIT':
            return 'ಬಹಳಷ್ಟು ವಿನಂತಿಗಳು ಬಂದಿವೆ. ದಯವಿಟ್ಟು ಕೆಲವು ಕ್ಷಣಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          default:
            return 'ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಯಿಂದಾಗಿ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ನಮ್ಮ ಆಫ್‌ಲೈನ್ ಪರಿಶೀಲನಾ ಎಂಜಿನ್ ಮೂಲಕ ಸೇವೆ ಮುಂದುವರೆಸಲಾಗಿದೆ.';
        }

      case 'hi':
        switch (code) {
          case 'TIMEOUT':
            return 'प्रतिक्रिया में अधिक समय लग रहा है। कृपया पुनः प्रयास करें।';
          case 'RATE_LIMIT':
            return 'सर्वर पर अत्यधिक अनुरोध हैं। कृपया कुछ क्षण प्रतीक्षा करें।';
          default:
            return 'तकनीकी समस्या के कारण मुख्य सर्वर अनुपलब्ध है। हमारी ऑफलाइन प्रणाली द्वारा उत्तर दिया जा रहा है।';
        }

      case 'en':
      default:
        switch (code) {
          case 'TIMEOUT':
            return 'The request timed out. Please try again or check the official government portal directly.';
          case 'RATE_LIMIT':
            return 'High server traffic. Please wait a moment before asking your next question.';
          default:
            return 'The AI service is temporarily experiencing difficulties. Information is being retrieved from our verified local government directory.';
        }
    }
  }
}

export const aiErrorHandler = new AIErrorHandler();
