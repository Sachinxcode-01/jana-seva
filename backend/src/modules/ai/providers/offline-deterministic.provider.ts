import { IAIProvider } from './ai-provider.interface.js';
import { AIRequest, AIResponse, ResponseLength } from '../types.js';
import { Scheme } from '../../../types.js';

export class OfflineDeterministicProvider implements IAIProvider {
  public async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  public getProviderName(): string {
    return 'Janaseva Advisory Rule Engine (Offline Grounded)';
  }

  public async generateResponse(request: AIRequest): Promise<AIResponse> {
    const text = this.formatReply(request);
    return {
      text,
      modelUsed: 'Janaseva Offline Rule Engine',
      providerName: this.getProviderName(),
      confidence: 1.0,
      isFallback: true
    };
  }

  public async streamResponse(
    request: AIRequest,
    onChunk: (token: string) => void
  ): Promise<AIResponse> {
    const response = await this.generateResponse(request);
    // Simulate streaming by yielding words/tokens
    const words = response.text.split(/(\s+)/);
    for (const word of words) {
      onChunk(word);
    }
    return response;
  }

  private formatReply(request: AIRequest): string {
    const { prompt, language, schemes = [], isFollowUp, responseLength = 'standard', activeScheme } = request;
    const lower = prompt.toLowerCase();

    // 1. If greeting
    if (this.isGreeting(lower)) {
      if (language === 'kn') {
        return 'ನಮಸ್ಕಾರ! ಜನಸೇವಾ ನಾಗರಿಕ ಕಲ್ಯಾಣ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ. ಕರ್ನಾಟಕ ಮತ್ತು ಕೇಂದ್ರ ಸರ್ಕಾರದ 60 ಕ್ಕೂ ಹೆಚ್ಚು ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು, ಗೃಹ ಲಕ್ಷ್ಮಿ, ಪಿಎಂ-ಕಿಸಾನ್, ಶಕ್ತಿ ಬಸ್ ಯೋಜನೆ ಹಾಗೂ ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕುರಿತು ನಾನು ನಿಮಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
      }
      if (language === 'hi') {
        return 'नमस्ते! जनसेवा नागरिक कल्याण मंच में आपका स्वागत है। मैं आपको कर्नाटक और केंद्र सरकार की 60 से अधिक योजनाओं, गृह लक्ष्मी, पीएम-किसान, छात्रवृत्ति और स्वास्थ्य योजनाओं के बारे में सत्यापित जानकारी प्रदान कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?';
      }
      return 'Namaste! Welcome to JANASEVA Citizen Welfare Advisory. I can help you find verified government schemes across Karnataka State and Central India, including PM-KISAN, Gruha Lakshmi, SSP Scholarships, Shakti bus scheme, and Ayushman Bharat. How may I assist you today?';
    }

    // 2. If no schemes matched
    if (schemes.length === 0) {
      if (language === 'kn') {
        return 'ಕ್ಷಮಿಸಿ, ನೀವು ಕೇಳಿದ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ನೇರ ಸರ್ಕಾರಿ ಯೋಜನೆಯ ಮಾಹಿತಿ ನಮ್ಮ ಡೈರೆಕ್ಟರಿಯಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೃಹ ಲಕ್ಷ್ಮಿ, ಶಕ್ತಿ ಯೋಜನೆ, ಪಿಎಂ-ಕಿಸಾನ್, ಅನ್ನ ಭಾಗ್ಯ, ಯುವ ನಿಧಿ ಅಥವಾ ಎಸ್‌ಎಸ್‌ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನದಂತಹ ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಹೆಸರನ್ನು ಬಳಸಿ ಕೇಳಿ.';
      }
      if (language === 'hi') {
        return 'क्षमा करें, आपके अनुरोध के अनुसार हमारे पास कोई सत्यापित सरकारी योजना रिकॉर्ड नहीं मिला। कृपया पीएम-किसान, गृह लक्ष्मी, शक्ति योजना या आयुष्मान भारत जैसे किसी विशिष्ट योजना का नाम लिखकर पुनः पूछें।';
      }
      return "I could not find a verified government scheme matching your specific inquiry. You can ask me about popular programs like Gruha Lakshmi, PM-KISAN, SSP Scholarship, Shakti Scheme, or Ayushman Bharat.";
    }

    const primary = schemes[0];
    const isSpecificFollowUp = isFollowUp || !!activeScheme;

    // Check specific intent: Eligibility
    if (lower.includes('eligible') || lower.includes('eligibility') || lower.includes('ಅರ್ಹತೆ') || lower.includes('ಯಾರು') || lower.includes('पात्र')) {
      return this.formatEligibilityReply(primary, language, responseLength);
    }

    // Check specific intent: Documents
    if (lower.includes('document') || lower.includes('proof') || lower.includes('ದಾಖಲೆ') || lower.includes('ದಸ್ತಾವೇಜು') || lower.includes('दस्तावेज')) {
      return this.formatDocumentsReply(primary, language, responseLength);
    }

    // Check specific intent: Application Procedure
    if (lower.includes('apply') || lower.includes('procedure') || lower.includes('online') || lower.includes('ಅರ್ಜಿ') || lower.includes('आवेदन')) {
      return this.formatApplicationReply(primary, language, responseLength);
    }

    // Check specific intent: Benefits
    if (lower.includes('benefit') || lower.includes('money') || lower.includes('amount') || lower.includes('ಹಣ') || lower.includes('ಲಾಭ') || lower.includes('राशि')) {
      return this.formatBenefitsReply(primary, language, responseLength);
    }

    // Default: Comprehensive Scheme Overview
    return this.formatOverviewReply(primary, language, responseLength);
  }

  private formatOverviewReply(scheme: Scheme, lang: string, length: ResponseLength): string {
    const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
    const desc = scheme.description;
    const benefits = scheme.benefits.slice(0, length === 'concise' ? 1 : 3).join('; ');
    const rules = (scheme.eligibilityCriteria.rules || []).slice(0, length === 'concise' ? 2 : 4);
    const docs = (scheme.requiredDocuments || []).slice(0, length === 'concise' ? 3 : 5);
    const portal = scheme.officialWebsite;

    if (lang === 'kn') {
      let out = `📌 **${name}** (${scheme.category})\n\n${desc}\n\n`;
      out += `✨ **ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು:**\n${benefits}\n\n`;
      if (length !== 'concise') {
        out += `🎯 **ಅರ್ಹತಾ ಮಾನದಂಡಗಳು:**\n${rules.map(r => `• ${r}`).join('\n')}\n\n`;
        out += `📄 **ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು:**\n${docs.map(d => `• ${d}`).join('\n')}\n\n`;
      }
      out += `🌐 **ಅಧಿಕೃತ ಪೋರ್ಟಲ್:** [${portal}](${portal})\n\n💡 *ಸೂಚನೆ: ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಸಂಪೂರ್ಣವಾಗಿ ಉಚಿತವಾಗಿದೆ.*`;
      return out;
    }

    if (lang === 'hi') {
      let out = `📌 **${name}** (${scheme.category})\n\n${desc}\n\n`;
      out += `✨ **मुख्य लाभ:**\n${benefits}\n\n`;
      if (length !== 'concise') {
        out += `🎯 **पात्रता मानदंड:**\n${rules.map(r => `• ${r}`).join('\n')}\n\n`;
        out += `📄 **आवश्यक दस्तावेज:**\n${docs.map(d => `• ${d}`).join('\n')}\n\n`;
      }
      out += `🌐 **आधिकारिक पोर्टल:** [${portal}](${portal})\n\n💡 *सलाह: सरकारी पोर्टल पर पंजीकरण पूर्णतः निःशुल्क है।*`;
      return out;
    }

    let out = `📌 **${name}** (${scheme.category})\n\n${desc}\n\n`;
    out += `✨ **Key Benefits:**\n${benefits}\n\n`;
    if (length !== 'concise') {
      out += `🎯 **Eligibility Criteria:**\n${rules.map(r => `• ${r}`).join('\n')}\n\n`;
      out += `📄 **Required Documents:**\n${docs.map(d => `• ${d}`).join('\n')}\n\n`;
    }
    out += `🌐 **Official Free Portal:** [${portal}](${portal})\n\n💡 *Advisory: Official registrations on government portals are 100% free of charge.*`;
    return out;
  }

  private formatEligibilityReply(scheme: Scheme, lang: string, length: ResponseLength): string {
    const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
    const rules = scheme.eligibilityCriteria.rules || [];
    const crit = scheme.eligibilityCriteria;
    const items = [...rules];

    if (crit.minAge !== undefined || crit.maxAge !== undefined) {
      items.push(`Age: ${crit.minAge || 0} to ${crit.maxAge || 100} years`);
    }
    if (crit.maxAnnualIncome) {
      items.push(`Annual family income ceiling: ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}`);
    }
    if (crit.applicableStates && crit.applicableStates.includes('Karnataka')) {
      items.push(`Resident of Karnataka State required`);
    }

    const rulesToDisplay = length === 'concise' ? items.slice(0, 3) : items;

    if (lang === 'kn') {
      return `🎯 **${name} - ಅರ್ಹತಾ ಮಾನದಂಡಗಳು:**\n\n${rulesToDisplay.map(r => `• ${r}`).join('\n')}\n\nಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಅಧಿಕೃತ ಪೋರ್ಟಲ್: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
    }
    if (lang === 'hi') {
      return `🎯 **${name} - पात्रता मानदंड:**\n\n${rulesToDisplay.map(r => `• ${r}`).join('\n')}\n\nआधिकारिक पोर्टल: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
    }
    return `🎯 **${name} - Eligibility Criteria:**\n\n${rulesToDisplay.map(r => `• ${r}`).join('\n')}\n\nOfficial Portal: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
  }

  private formatDocumentsReply(scheme: Scheme, lang: string, length: ResponseLength): string {
    const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
    const docs = (scheme.requiredDocuments || []).slice(0, length === 'concise' ? 3 : 8);

    if (lang === 'kn') {
      return `📄 **${name} - ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳ ಪಟ್ಟಿ:**\n\n${docs.map(d => `• ${d}`).join('\n')}\n\nದಯವಿಟ್ಟು ಎಲ್ಲಾ ದಾಖಲೆಗಳ ಮೂಲ ಮತ್ತು ಜೆರಾಕ್ಸ್ ಪ್ರತಿಗಳನ್ನು ಗ್ರಾಮ ಒನ್ ಅಥವಾ ಕರ್ನಾಟಕ ಒನ್ ಕೇಂದ್ರಕ್ಕೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.`;
    }
    if (lang === 'hi') {
      return `📄 **${name} - आवश्यक दस्तावेजों की सूची:**\n\n${docs.map(d => `• ${d}`).join('\n')}\n\nकृपया आवेदन करते समय अपने मूल दस्तावेज और आधार कार्ड साथ रखें।`;
    }
    return `📄 **${name} - Required Document Checklist:**\n\n${docs.map(d => `• ${d}`).join('\n')}\n\nMake sure your Aadhaar is linked with your bank account for Direct Benefit Transfer (DBT).`;
  }

  private formatApplicationReply(scheme: Scheme, lang: string, length: ResponseLength): string {
    const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
    const steps = scheme.applicationProcedure.steps || [];

    if (lang === 'kn') {
      return `📝 **${name} - ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ:**\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n🌐 **ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಿಂಕ್:** [${scheme.officialWebsite}](${scheme.officialWebsite})\n\n💡 *ಎಚ್ಚರಿಕೆ: ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಗೆ ಹಣ ನೀಡಬೇಡಿ. ಸೇವಾ ಸಿಂಧು ಹಾಗೂ ಸರ್ಕಾರಿ ಕೇಂದ್ರಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಉಚಿತವಾಗಿದೆ.*`;
    }
    if (lang === 'hi') {
      return `📝 **${name} - आवेदन करने की प्रक्रिया:**\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n🌐 **आधिकारिक पोर्टल:** [${scheme.officialWebsite}](${scheme.officialWebsite})\n\n💡 *चेतावनी: आवेदन के लिए किसी भी बिचौलिए को पैसे न दें। सरकारी पोर्टल पर पंजीकरण पूरी तरह से निःशुल्क है।*`;
    }
    return `📝 **${name} - How to Apply:**\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n🌐 **Official Portal Link:** [${scheme.officialWebsite}](${scheme.officialWebsite})\n\n💡 *Alert: Do not pay unauthorized brokers. Applications on official government portals are 100% free.*`;
  }

  private formatBenefitsReply(scheme: Scheme, lang: string, length: ResponseLength): string {
    const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
    const benefits = scheme.benefits || [];

    if (lang === 'kn') {
      return `✨ **${name} - ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಪ್ರಯೋಜನಗಳು:**\n\n${benefits.map(b => `• ${b}`).join('\n')}\n\nಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಭೇಟಿ ನೀಡಿ: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
    }
    if (lang === 'hi') {
      return `✨ **${name} - लाभ और सहायता विवरण:**\n\n${benefits.map(b => `• ${b}`).join('\n')}\n\nअधिक जानकारी के लिए देखें: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
    }
    return `✨ **${name} - Benefits & Financial Assistance:**\n\n${benefits.map(b => `• ${b}`).join('\n')}\n\nFor verified details visit: [${scheme.officialWebsite}](${scheme.officialWebsite})`;
  }

  private isGreeting(query: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'namaste', 'namaskara', 'ನಮಸ್ಕಾರ', 'ಹಲೋ', 'नमस्ते', 'प्रणाम'];
    const words = query.trim().split(/\s+/);
    return words.length <= 3 && greetings.some(g => query.includes(g));
  }
}
