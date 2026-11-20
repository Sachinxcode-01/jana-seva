export class ResponseFormatterService {
  /**
   * Normalizes written response text into speech-ready text for TTS
   * Removes markdown bold/bullets, converts numbers and currency symbols into natural spoken words
   */
  public formatForSpeech(text: string, language = 'en'): string {
    if (!text) return '';

    let speechText = text
      // Strip markdown links [label](url) -> label
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Strip bold, italics, headers, code backticks
      .replace(/[\*\_`#~]/g, '')
      // Remove raw URLs so TTS doesn't spell out "h-t-t-p-s-colon-slash-slash..."
      .replace(/https?:\/\/[^\s]+/g, language === 'kn' ? 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್' : language === 'hi' ? 'आधिकारिक वेबसाइट' : 'official website')
      // Normalize currency symbol ₹ to words
      .replace(/₹\s*([0-9,]+)/g, (_match, p1) => {
        const cleanNum = p1.replace(/,/g, '');
        if (language === 'kn') {
          return `${cleanNum} ರೂಪಾಯಿಗಳು`;
        }
        if (language === 'hi') {
          return `${cleanNum} रुपये`;
        }
        return `${cleanNum} rupees`;
      })
      // Normalize percentages
      .replace(/([0-9]+)\s*%/g, (_match, p1) => {
        if (language === 'kn') return `${p1} ಪ್ರತಿಶತ`;
        if (language === 'hi') return `${p1} प्रतिशत`;
        return `${p1} percent`;
      })
      // Normalize bullet characters to slight pauses (commas)
      .replace(/^[•\-\*]\s+/gm, '')
      // Normalize multiple linebreaks
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ', ')
      .trim();

    return speechText;
  }

  /**
   * Cleans and structures the text reply for rich UI rendering
   */
  public formatForDisplay(text: string): string {
    return text.trim();
  }
}

export const responseFormatterService = new ResponseFormatterService();
