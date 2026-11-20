import https from 'https';
import { CONFIG } from '../../config.js';
import { knowledgeService } from '../knowledge/knowledge.service.js';
import { contextManagerService, ConversationTurn } from './context-manager.service.js';
import { responseFormatterService } from './response-formatter.service.js';
import { IndicLanguageCode } from '../voice/voice.types.js';
import { Scheme } from '../../types.js';

export interface AssistantQueryResult {
  reply: string;
  speechText: string;
  language: IndicLanguageCode;
  suggestedSchemes: Array<{
    id: string;
    name: string;
    category: string;
    slug: string;
    officialWebsite: string;
  }>;
  modelUsed: string;
  sentences: string[];
}

export class AssistantService {
  /**
   * Main entrypoint for processing user messages
   */
  public async processQuery(
    rawMessage: string,
    languageHint?: string,
    history: ConversationTurn[] = []
  ): Promise<AssistantQueryResult> {
    const query = rawMessage.trim();

    // 1. Resolve Language & Multi-Turn Context
    const language = contextManagerService.resolveLanguage(query, languageHint);

    // If query is an elliptic follow-up (e.g. "Who is eligible?"), augment with prior scheme context
    let effectiveQuery = query;
    const isFollowUp = this.isFollowUpQuestion(query);
    if (isFollowUp) {
      const activeScheme = contextManagerService.extractActiveSchemeContext(history);
      if (activeScheme) {
        effectiveQuery = `${activeScheme} ${query}`;
      }
    }

    // 2. Retrieve Grounded Government Scheme Context via RAG
    const knowledgeResult = knowledgeService.getGroundedContext(effectiveQuery, language, 4);
    const suggestedSchemes = knowledgeResult.schemes.map(s => ({
      id: s.id,
      name: language === 'kn' ? (s.name_kn || s.name) : language === 'hi' ? (s.name_hi || s.name) : s.name,
      category: s.category,
      slug: s.slug,
      officialWebsite: s.officialWebsite
    }));

    // 3. Generate Response via LLM (OpenRouter) with Grounded System Rules
    let replyText = '';
    let modelUsed = 'Janaseva Knowledge & Rule Engine';

    if (CONFIG.OPENROUTER_API_KEY) {
      const llmResult = await this.callLLM(query, language, knowledgeResult.groundingContextText, history);
      if (llmResult && llmResult.text) {
        replyText = llmResult.text;
        modelUsed = `OpenRouter (${llmResult.model})`;
      }
    }

    // 4. Fallback to Grounded Deterministic Rule Engine if LLM unavailable
    if (!replyText) {
      replyText = this.generateDeterministicGroundedReply(query, language, knowledgeResult.schemes, isFollowUp);
      modelUsed = 'Janaseva Advisory Rule Engine (Offline Grounded)';
    }

    // 5. Format for Speech and UI Display
    const cleanDisplayReply = responseFormatterService.formatForDisplay(replyText);
    const speechText = responseFormatterService.formatForSpeech(cleanDisplayReply, language);
    const sentences = this.extractSentenceChunks(cleanDisplayReply);

    return {
      reply: cleanDisplayReply,
      speechText,
      language,
      suggestedSchemes,
      modelUsed,
      sentences
    };
  }

  private isFollowUpQuestion(query: string): boolean {
    const lower = query.toLowerCase();
    const followUpIndicators = [
      'who is eligible', 'what documents', 'how to apply', 'where to apply',
      'eligibility', 'documents', 'last date', 'deadline', 'how much money',
      'benefits', 'ಯಾರು ಅರ್ಹರು', 'ದಾಖಲೆಗಳು', 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ',
      'पात्र कौन है', 'दस्तावेज क्या हैं', 'आवेदन कैसे करें'
    ];
    return followUpIndicators.some(ind => lower.includes(ind)) && lower.split(/\s+/).length <= 6;
  }

  private extractSentenceChunks(text: string): string[] {
    const clean = text.replace(/[*_#`]/g, '');
    const sentences = clean.match(/[^.!?।\n]+[.!?।\n]+/g);
    if (!sentences || sentences.length === 0) return [clean.trim()];
    return sentences.map(s => s.trim()).filter(Boolean);
  }

  private async callLLM(
    userQuery: string,
    lang: IndicLanguageCode,
    groundingContext: string,
    history: ConversationTurn[]
  ): Promise<{ text: string; model: string } | null> {
    const apiKey = CONFIG.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const langInstruction = this.getLanguageInstruction(lang);

    const systemPrompt = `You are Janaseva AI Assistant, an advanced, multilingual, human-like voice assistant for Indian Government Services and Citizen Welfare Schemes.

## Core Directives:
1. Speak in a warm, polite, respectful, and natural Indian conversational tone.
2. Reply fluently and directly in the requested language: ${langInstruction}.
3. GROUND ALL FACTUAL SCHEME INFORMATION STRICTLY in the provided OFFICIAL SCHEME DATABASE below.
4. If asked about a scheme, provide:
   - Official Scheme Name
   - Clear Objective and Benefits
   - Simple Eligibility breakdown
   - Required Documents checklist
   - Official Application steps
   - Official Portal Link
5. Explain eligibility rules in simple, citizen-friendly language. Always include an advisory note that final approvals are issued by the respective government department.
6. NEVER fabricate or invent government notifications, scheme names, income limits, deadlines, or monetary amounts. If details are not in the database, clearly say so.
7. Support natural multi-turn conversations: remember previous schemes discussed and answer follow-up questions directly without repeating greetings.
8. Keep answers concise, clear, and easy to understand when spoken aloud.

OFFICIAL SCHEME DATABASE:
${groundingContext}
`;

    const candidateModels = [
      CONFIG.OPENROUTER_MODEL,
      'openrouter/auto',
      'nvidia/nemotron-3.5-lightning:free'
    ].filter(Boolean);

    const recentHistory = history
      .filter(m => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-6);

    for (const model of candidateModels) {
      try {
        const payload = JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userQuery }
          ],
          temperature: 0.3,
          max_tokens: 1100
        });

        const result = await new Promise<{ text: string; model: string } | null>((resolve) => {
          const req = https.request({
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': Buffer.byteLength(payload, 'utf8'),
              'HTTP-Referer': CONFIG.FRONTEND_URL || 'http://localhost:5000',
              'X-Title': 'JANASEVA Public Welfare Portal'
            },
            timeout: 10000
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                if (res.statusCode === 200) {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.message?.content;
                  if (content && typeof content === 'string' && content.trim().length > 5) {
                    resolve({ text: content.trim(), model });
                    return;
                  }
                }
                resolve(null);
              } catch {
                resolve(null);
              }
            });
          });

          req.on('error', () => resolve(null));
          req.on('timeout', () => { req.destroy(); resolve(null); });
          req.write(payload);
          req.end();
        });

        if (result) return result;
      } catch {
        // try next candidate model
      }
    }

    return null;
  }

  private getLanguageInstruction(lang: IndicLanguageCode): string {
    switch (lang) {
      case 'kn':
        return 'Reply in warm, fluent, natural Kannada (ಕನ್ನಡ) using standard Unicode Kannada script with respectful tone.';
      case 'hi':
        return 'Reply in warm, polite, fluent Hindi (हिंदी) in clear Devanagari script.';
      case 'te':
        return 'Reply in warm, fluent Telugu (తెలుగు) in clear Unicode Telugu script.';
      case 'ta':
        return 'Reply in warm, fluent Tamil (தமிழ்) in clear Unicode Tamil script.';
      case 'ml':
        return 'Reply in warm, fluent Malayalam (മലയാളം) in clear Unicode Malayalam script.';
      case 'mr':
        return 'Reply in warm, polite Marathi (मराठी) in Devanagari script.';
      case 'bn':
        return 'Reply in warm, clear Bengali (বাংলা) in Unicode Bengali script.';
      case 'gu':
        return 'Reply in warm, fluent Gujarati (ગુજરાતી) in Unicode Gujarati script.';
      case 'pa':
        return 'Reply in warm, fluent Punjabi (ਪੰਜਾਬੀ) in Gurmukhi script.';
      case 'ur':
        return 'Reply in polite, respectful Urdu (اردو) in Nastaliq script.';
      case 'en':
      default:
        return 'Reply in clear, professional, warm, and natural conversational Indian English.';
    }
  }

  private generateDeterministicGroundedReply(
    query: string,
    lang: IndicLanguageCode,
    matchedSchemes: Scheme[],
    isFollowUp: boolean
  ): string {
    const qLower = query.toLowerCase();

    if (matchedSchemes.length > 0) {
      const scheme = matchedSchemes[0];
      const name = lang === 'kn' ? (scheme.name_kn || scheme.name) : lang === 'hi' ? (scheme.name_hi || scheme.name) : scheme.name;
      const desc = lang === 'kn' ? (scheme.description_kn || scheme.description) : lang === 'hi' ? (scheme.description_hi || scheme.description) : scheme.description;

      const isDoc = qLower.includes('document') || qLower.includes('proof') || qLower.includes('ದಾಖಲೆ') || qLower.includes('दस्तावेज');
      const isApply = qLower.includes('apply') || qLower.includes('procedure') || qLower.includes('ಹೇಗೆ') || qLower.includes('आवेदन');
      const isEligibility = qLower.includes('eligible') || qLower.includes('eligibility') || qLower.includes('ಯಾರು') || qLower.includes('पात्र');

      if (lang === 'kn') {
        if (isDoc) {
          return `**${name}** ಗಾಗಿ ಅಗತ್ಯವಿರುವ ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಪಟ್ಟಿ:\n\n` +
            scheme.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
            `\n\nಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${scheme.officialWebsite}`;
        }
        if (isApply) {
          return `**${name}** ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಅಧಿಕೃತ ವಿಧಾನ:\n\n` +
            scheme.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
            `\n\nಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್: ${scheme.applicationProcedure.onlineUrl || scheme.officialWebsite}`;
        }
        if (isEligibility) {
          return `**${name}** ಗಾಗಿ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು:\n\n` +
            scheme.eligibilityCriteria.rules.map(r => `• ${r}`).join('\n') +
            `\n\nಪ್ರಮುಖ ಟಿಪ್ಪಣಿ: ಈ ಮಾಹಿತಿ ಸಲಹಾತ್ಮಕವಾಗಿದ್ದು, ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖೆಯು ಪರಿಶೀಲಿಸುತ್ತದೆ.`;
        }
        return `**${name}** (${scheme.department}):\n\n${desc}\n\n**ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು:**\n` +
          scheme.benefits.map(b => `• ${b}`).join('\n') +
          `\n\nಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${scheme.officialWebsite}`;
      }

      if (lang === 'hi') {
        if (isDoc) {
          return `**${name}** के लिए आवश्यक आधिकारिक दस्तावेज:\n\n` +
            scheme.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
            `\n\nआधिकारिक पोर्टल: ${scheme.officialWebsite}`;
        }
        if (isApply) {
          return `**${name}** के लिए आवेदन प्रक्रिया:\n\n` +
            scheme.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
            `\n\nपोर्टल लिंक: ${scheme.applicationProcedure.onlineUrl || scheme.officialWebsite}`;
        }
        if (isEligibility) {
          return `**${name}** के लिए पात्रता मानदंड:\n\n` +
            scheme.eligibilityCriteria.rules.map(r => `• ${r}`).join('\n') +
            `\n\nसूचना: यह जानकारी परामर्श स्वरूप है, अंतिम निर्णय संबंधित विभाग द्वारा लिया जाता है।`;
        }
        return `**${name}** (${scheme.department}):\n\n${desc}\n\n**प्रमुख लाभ:**\n` +
          scheme.benefits.map(b => `• ${b}`).join('\n') +
          `\n\nआधिकारिक पोर्टल: ${scheme.officialWebsite}`;
      }

      // Default English
      if (isDoc) {
        return `Here are the official required documents for **${name}**:\n\n` +
          scheme.requiredDocuments.map((d, i) => `${i + 1}. **${d}**`).join('\n') +
          `\n\nOfficial Website: ${scheme.officialWebsite}`;
      }
      if (isApply) {
        return `Here is the official application procedure for **${name}**:\n\n` +
          scheme.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
          `\n\nOfficial Portal: ${scheme.applicationProcedure.onlineUrl || scheme.officialWebsite}`;
      }
      if (isEligibility) {
        return `Eligibility Criteria for **${name}**:\n\n` +
          scheme.eligibilityCriteria.rules.map(r => `• ${r}`).join('\n') +
          `\n\nNote: Eligibility guidance is advisory. Final approvals are granted by the ${scheme.department}.`;
      }
      return `**${name}** (${scheme.department})\n\n${desc}\n\n` +
        `**Key Benefits:**\n` + scheme.benefits.map(b => `• ${b}`).join('\n') + '\n\n' +
        `**Eligibility Criteria:**\n` + scheme.eligibilityCriteria.rules.map(r => `• ${r}`).join('\n') + '\n\n' +
        `Official Portal: ${scheme.officialWebsite}`;
    }

    // Friendly greeting fallback
    if (qLower.match(/^(hi|hello|hey|namaste|namaskara|good\s+morning|good\s+afternoon)\b/)) {
      if (lang === 'kn') return "ನಮಸ್ಕಾರ! ನಾನು ಜನಸೇವಾ ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್. ಗೃಹ ಲಕ್ಷ್ಮಿ, ಶಕ್ತಿ ಯೋಜನೆ, ಪಿಎಂ ಕಿಸಾನ್ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನದ ಬಗ್ಗೆ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
      if (lang === 'hi') return "नमस्ते! मैं जनसेवा वॉइस असिस्टेंट हूँ। गृह लक्ष्मी, शक्ति योजना, पीएम-किसान या छात्रवृत्ति योजनाओं के बारे में आप मुझसे पूछ सकते हैं।";
      return "Hello! I am your Janaseva Voice Assistant. How may I help you with government schemes, certificates, or eligibility rules today?";
    }

    if (lang === 'kn') {
      return "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ನೇರವಾದ ಯೋಜನೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೃಹ ಲಕ್ಷ್ಮಿ, ಶಕ್ತಿ ಯೋಜನೆ, ಪಿಎಂ ಕಿಸಾನ್, ಎಸ್‌ಎಸ್‌ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅಥವಾ ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಬಗ್ಗೆ ಕೇಳಿ.";
    }
    if (lang === 'hi') {
      return "क्षमा करें, इस प्रश्न से संबंधित सटीक सरकारी योजना नहीं मिली। कृपया गृह लक्ष्मी, शक्ति योजना, पीएम-किसान या एसएसपी छात्रवृत्ति के बारे में पूछें।";
    }
    return "I could not locate an exact scheme match for your query. You can ask about verified programs like Gruha Lakshmi, PM-KISAN, SSP Scholarship, Shakti Scheme, or Ayushman Bharat.";
  }
}

export const assistantService = new AssistantService();
