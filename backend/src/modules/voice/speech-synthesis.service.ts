import { voiceStudioClient } from './voicestudio.client.js';
import { VoiceProfile, SpeechSynthesisOptions, SpeechSynthesisResult, IndicLanguageCode } from './voice.types.js';

export const OFFICIAL_INDIAN_FEMALE_VOICES: VoiceProfile[] = [
  {
    id: 'kavya-indic',
    name: 'Kavya (Primary Indian Female Voice)',
    gender: 'female',
    accent: 'Indian English & Indic Warm Conversational',
    languageSupport: ['kn', 'en', 'hi', 'te', 'ta', 'ml', 'mr', 'bn', 'gu'],
    description: 'Natural, warm, polite tone tailored for Indian civic welfare and citizen support.',
    isDefault: true
  },
  {
    id: 'priya-in',
    name: 'Priya (Professional Public Service)',
    gender: 'female',
    accent: 'Clear Indian Formal Accent',
    languageSupport: ['en', 'hi', 'kn', 'mr', 'bn'],
    description: 'Clear, crisp, authoritative yet empathetic public administration voice.'
  },
  {
    id: 'neerja-in',
    name: 'Neerja (Empathetic Elder Sister)',
    gender: 'female',
    accent: 'Gentle Indian Accent',
    languageSupport: ['kn', 'hi', 'en', 'te', 'ta'],
    description: 'Patient and encouraging voice recommended for elderly citizens and rural beneficiaries.'
  },
  {
    id: 'nova-in',
    name: 'Nova (Modern Expressive)',
    gender: 'female',
    accent: 'Modern Pan-Indian Accent',
    languageSupport: ['en', 'hi', 'kn', 'te', 'ta', 'ml', 'gu', 'bn', 'mr'],
    description: 'Modern, dynamic speech synthesis profile with high clarity across technical names.'
  }
];

export class SpeechSynthesisService {
  /**
   * Generates instruction prompts for VoiceStudio's OmniVoice engine to ensure
   * high quality Indian female delivery with proper cadence, respectful tone, and natural pauses
   */
  public getVoiceInstructions(language: string, voiceId = 'kavya-indic'): string {
    const base = 'Indian female voice, warm, friendly, respectful, empathetic, clear pronunciation of government welfare schemes and rupee amounts, moderate pace, natural pauses';

    switch (language) {
      case 'kn':
        return `${base}, spoken in natural, respectful Kannada (ಕನ್ನಡ) with authentic Karnataka regional pronunciation for Seva Sindhu, Grama One, and State welfare schemes.`;
      case 'hi':
        return `${base}, spoken in clear, respectful conversational Hindi (हिंदी) with polite honorifics (जी, आपका) and clear articulation.`;
      case 'te':
        return `${base}, spoken in natural, polite Telugu (తెలుగు) with clear diction.`;
      case 'ta':
        return `${base}, spoken in respectful, clear Tamil (தமிழ்).`;
      case 'ml':
        return `${base}, spoken in warm, authentic Malayalam (മലയാളം).`;
      case 'mr':
        return `${base}, spoken in respectful, polite Marathi (मराठी).`;
      case 'bn':
        return `${base}, spoken in sweet, clear Bengali (বাংলা).`;
      case 'gu':
        return `${base}, spoken in friendly, clear Gujarati (ગુજરાતી).`;
      case 'en':
      default:
        return `${base}, spoken in natural, fluent Indian English with clear pronunciation of Indian civic terms and currency (Rupees).`;
    }
  }

  /**
   * Splits text into coherent sentence chunks for real-time streaming TTS
   */
  public splitIntoSentences(text: string): string[] {
    if (!text || text.trim().length === 0) return [];

    // Strip markdown formatting symbols and clean URLs
    const clean = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
      .replace(/https?:\/\/\S+/g, '') // remove raw URLs for speech
      .trim();

    // Split on sentence boundaries including Indic danda (।) and double newlines
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
        // Synthesize in natural chunks of at least 30 characters
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

  /**
   * Synthesize text using VoiceStudio with fallback audio generation
   */
  public async synthesize(
      text: string,
      options: SpeechSynthesisOptions = {}
    ): Promise<SpeechSynthesisResult | null> {
    const voiceId = options.voice || 'kavya-indic';
    const lang = options.language || 'en';
    const instructions = options.instructions || this.getVoiceInstructions(lang, voiceId);

    return voiceStudioClient.synthesizeSpeech(text, {
      ...options,
      voice: voiceId,
      instructions
    });
  }

  /**
   * Streams audio chunks directly via VoiceStudio
   */
  public async synthesizeStream(
      text: string,
      options: SpeechSynthesisOptions = {},
      onChunk: (chunk: Buffer) => void
    ): Promise<boolean> {
    const voiceId = options.voice || 'kavya-indic';
    const lang = options.language || 'en';
    const instructions = options.instructions || this.getVoiceInstructions(lang, voiceId);

    return voiceStudioClient.synthesizeSpeechStream(text, {
      ...options,
      voice: voiceId,
      instructions
    }, onChunk);
  }

  /**
   * Discovers and returns available voice profiles, merging verified Indian female
   * profiles with dynamic voices reported by the active VoiceStudio engine
   */
  public async getAvailableVoiceProfiles(): Promise<VoiceProfile[]> {
    const dynamicVoices = await voiceStudioClient.listVoices().catch(() => []);
    if (dynamicVoices.length === 0) {
      return OFFICIAL_INDIAN_FEMALE_VOICES;
    }

    const profiles: VoiceProfile[] = [...OFFICIAL_INDIAN_FEMALE_VOICES];
    const existingIds = new Set(profiles.map(p => p.id.toLowerCase()));

    for (const dv of dynamicVoices) {
      const id = dv.voice_id || dv.id || dv.name;
      if (!id || existingIds.has(id.toLowerCase())) continue;

      profiles.push({
        id,
        name: dv.name || id,
        gender: dv.gender || 'female',
        accent: dv.accent || dv.description || 'VoiceStudio Engine Voice',
        languageSupport: dv.languages || dv.language ? [dv.language] : ['en', 'kn', 'hi'],
        description: dv.description || `VoiceStudio discovered voice (${id})`,
        isDynamic: true
      });
      existingIds.add(id.toLowerCase());
    }

    return profiles;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
