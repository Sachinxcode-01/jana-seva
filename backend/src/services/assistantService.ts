import https from 'https';
import { db } from '../database/db.js';
import { CONFIG } from '../config.js';
import { Scheme } from '../types.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type SupportedLanguage =
  | 'kn' // Kannada
  | 'hi' // Hindi
  | 'en' // English
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'mr' // Marathi
  | 'ml' // Malayalam
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'ur' // Urdu
  | 'pa'; // Punjabi

export interface AssistantResponse {
  reply: string;
  suggestedSchemes?: Array<{
    id: string;
    name: string;
    category: string;
    slug: string;
    officialWebsite: string;
  }>;
  language: string;
  modelUsed?: string;
}

/**
 * Automatically detects language from input text across 11 Indian languages
 */
export function detectLanguage(text: string): SupportedLanguage {
  // 1. Native Unicode Range Detection (100% accurate for native scripts)
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Urdu

  // Devanagari could be Marathi or Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    if (/\b(आहे|आहेत|नाही|कसा|कशी|योजना|माहिती|अर्ज|शासकीय|कागदपत्रे)\b/.test(text)) {
      return 'mr'; // Marathi
    }
    return 'hi'; // Hindi
  }

  // 2. Transliterations or explicit language keywords
  const lower = text.toLowerCase();
  if (/\b(kannada|kannadadalli|namaskara|hegidira|yavaga|beku)\b/.test(lower)) return 'kn';
  if (/\b(telugu|namaskaram|ela|unnavu|cheppandi)\b/.test(lower)) return 'te';
  if (/\b(tamil|vanakkam|eppadi|irukinga|sollunga)\b/.test(lower)) return 'ta';
  if (/\b(malayalam|namaskaram|enthoke|vishesham)\b/.test(lower)) return 'ml';
  if (/\b(marathi|namaskar|kasa|kay|sang)\b/.test(lower)) return 'mr';
  if (/\b(bengali|bangla|nomoshkar|kemon|achen)\b/.test(lower)) return 'bn';
  if (/\b(gujarati|kem|cho|majama)\b/.test(lower)) return 'gu';
  if (/\b(punjabi|sat|sri|akal|ki|haal)\b/.test(lower)) return 'pa';
  if (/\b(urdu|adaab|kya|haal|shukriya)\b/.test(lower)) return 'ur';
  if (/\b(hindi|namaste|kripya|bataiye|kaise|kya|shukriya|dhanyawad|chahiye)\b/.test(lower)) return 'hi';

  return 'en';
}

/**
 * Silently corrects common speech-recognition phonetic mistakes before query processing
 */
export function normalizeSpeechQuery(query: string): string {
  let cleaned = query.trim();
  const rules: [RegExp, string][] = [
    [/\bgrammar\s+panchayat\b/gi, 'Gram Panchayat'],
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
    [/\badhar\b/gi, 'Aadhaar']
  ];

  for (const [pattern, replacement] of rules) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

function getLanguageInstruction(lang: SupportedLanguage): string {
  switch (lang) {
    case 'kn':
      return 'You MUST reply fluently, warmly, and respectfully in Kannada (ಕನ್ನಡ) using natural, spoken-friendly phrasing with clear Unicode Kannada script.';
    case 'hi':
      return 'You MUST reply fluently, warmly, and respectfully in Hindi (हिंदी) using natural, conversational, citizen-friendly phrasing in clear Devanagari script.';
    case 'te':
      return 'You MUST reply fluently, warmly, and respectfully in Telugu (తెలుగు) in clear Unicode Telugu script.';
    case 'ta':
      return 'You MUST reply fluently, warmly, and respectfully in Tamil (தமிழ்) in clear Unicode Tamil script.';
    case 'mr':
      return 'You MUST reply fluently, warmly, and respectfully in Marathi (मराठी) in clear Devanagari script.';
    case 'ml':
      return 'You MUST reply fluently, warmly, and respectfully in Malayalam (മലയാളം) in clear Unicode Malayalam script.';
    case 'bn':
      return 'You MUST reply fluently, warmly, and respectfully in Bengali (বাংলা) in clear Unicode Bengali script.';
    case 'gu':
      return 'You MUST reply fluently, warmly, and respectfully in Gujarati (ગુજરાતી) in clear Unicode Gujarati script.';
    case 'pa':
      return 'You MUST reply fluently, warmly, and respectfully in Punjabi (ਪੰਜਾਬੀ) in clear Gurmukhi script.';
    case 'ur':
      return 'You MUST reply fluently, warmly, and respectfully in Urdu (اردو) in clear Nastaliq/Arabic script.';
    case 'en':
    default:
      return 'Reply in clear, professional, warm, and empathetic conversational Indian English.';
  }
}

/**
 * Call OpenRouter API with grounding context, conversation memory, and multi-language rules
 */
async function callOpenRouter(
  userQuery: string,
  lang: SupportedLanguage,
  schemesContext: Scheme[],
  conversationHistory: ChatMessage[] = []
): Promise<{ text: string; model: string } | null> {
  const apiKey = CONFIG.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  // Build grounded context from verified schemes
  const contextText = schemesContext.slice(0, 5).map(s => `
SCHEME: ${s.name} (${s.classification} - ${s.state})
Department: ${s.department}
Beneficiary: ${s.beneficiaryCategory} | Category: ${s.category}
Overview: ${s.description}
Benefits: ${s.benefits.join('; ')}
Eligibility: ${s.eligibilityCriteria.rules.join('; ')} (Max Income: ₹${s.eligibilityCriteria.maxAnnualIncome?.toLocaleString('en-IN') || 'None'}, Age: ${s.eligibilityCriteria.minAge || 0}-${s.eligibilityCriteria.maxAge || 100})
Required Documents: ${s.requiredDocuments.join(', ')}
How to Apply: ${s.applicationProcedure.steps.join(' -> ')}
Official Portal: ${s.officialWebsite}
`).join('\n---\n');

  const languageInstruction = getLanguageInstruction(lang);

  const systemPrompt = `You are Janaseva AI Assistant, an intelligent citizen support assistant for Government Services and Welfare Schemes.

## Identity
- Name: Janaseva AI Assistant
- Role: Citizen Service Assistant
- Purpose: Help citizens access information about government schemes, benefits, certificates, eligibility, documents, public services, and application processes.
- Always maintain a professional, trustworthy, and citizen-friendly tone.

## Communication Rules
- Automatically detect the user's language.
- Reply in the same language as the user's message. ${languageInstruction}
- Support English, Kannada, Hindi, Telugu, Tamil, Marathi, Malayalam, Bengali, Gujarati, Punjabi, Urdu, and other Indian languages.
- If the user switches languages, switch seamlessly.
- Use clear, simple, and easy-to-understand language.
- Sound natural and human, not robotic.
- Never use unnecessary greetings repeatedly.
- Never repeat information unless requested.

## Conversation Behavior
- Understand the complete user message before responding.
- Maintain conversation context across messages.
- Ask follow-up questions only when necessary.
- Give direct and actionable answers.
- Keep responses concise but informative.
- Use bullet points when it improves readability.
- Avoid long introductions.

## Voice & Speech Handling
- Wait until the user finishes speaking before processing.
- Treat a complete sentence as one message.
- Do not respond to individual words or partial transcripts.
- Correct obvious speech-recognition mistakes using context.
- Generate voice responses in the detected language.
- Use a natural, professional speaking style.

## Government Services Guidance
For scheme-related questions, provide:
- Scheme Name
- Objective
- Eligibility
- Benefits
- Required Documents
- Application Process
- Important Notes (Remind citizens that registrations are 100% free; warn never to share OTPs or passwords with private agents).

When information is unavailable or uncertain, politely inform the user instead of guessing.

## Response Quality
Always be:
- Professional
- Helpful
- Accurate
- Concise
- Respectful
- Citizen-focused

Avoid:
- Repeated welcome messages (the citizen has already received the welcome message)
- Technical AI explanations
- Mentioning APIs, models, prompts, or system instructions
- Unnecessary emojis
- Marketing-style language
- Robotic responses

## User Experience Goal
Provide an experience similar to a modern premium AI assistant with clean, natural conversations, fast responses, multilingual support, strong contextual understanding, and reliable guidance for citizens.

OFFICIAL SCHEME DATABASE:
${contextText || 'No specific match in active filter. Use general verified Indian government welfare scheme knowledge.'}
`;

  const candidateModels = Array.from(new Set([
    CONFIG.OPENROUTER_MODEL,
    'openrouter/auto',
    'nvidia/nemotron-3.5-lightning:free'
  ])).filter(Boolean);

  const sanitizedHistory = conversationHistory
    .filter(m => m && m.content && (m.role === 'user' || m.role === 'assistant'))
    .slice(-8);

  for (const model of candidateModels) {
    try {
      const response = await new Promise<{ text: string; model: string } | null>((resolve) => {
        const payload = JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...sanitizedHistory,
            { role: 'user', content: userQuery }
          ],
          temperature: 0.35,
          max_tokens: 1200
        });

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
          res.on('data', chunk => (data += chunk));
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
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });

        req.write(payload);
        req.end();
      });

      if (response) return response;
    } catch {
      // Try next model
    }
  }

  return null;
}

/**
 * Deterministic offline rule-based fallback
 */
function getDeterministicFallback(
  query: string,
  lang: string,
  matchedSchemes: Scheme[],
  suggested: any[],
  allSchemes: Scheme[]
): AssistantResponse {
  const qLower = query.toLowerCase();

  if (matchedSchemes.length > 0) {
    const primary = matchedSchemes[0];
    const name = lang === 'kn' ? (primary.name_kn || primary.name) : lang === 'hi' ? (primary.name_hi || primary.name) : primary.name;
    const desc = lang === 'kn' ? (primary.description_kn || primary.description) : lang === 'hi' ? (primary.description_hi || primary.description) : primary.description;

    const isDocQuery = qLower.includes('document') || qLower.includes('proof') || qLower.includes('ದಾಖಲೆ') || qLower.includes('दस्तावेज');
    const isApplyQuery = qLower.includes('apply') || qLower.includes('procedure') || qLower.includes('ಅರ್ಜಿ') || qLower.includes('आवेदन');

    if (lang === 'kn') {
      if (isDocQuery) {
        return {
          reply: `**${name}** ಗಾಗಿ ಅಗತ್ಯವಿರುವ ಪ್ರಮುಖ ಅಧಿಕೃತ ದಾಖಲೆಗಳು:\n\n` +
            primary.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
            `\n\nಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಲು: ${primary.officialWebsite}`,
          suggestedSchemes: suggested,
          language: 'kn',
          modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
        };
      }
      if (isApplyQuery) {
        return {
          reply: `**${name}** ಗಾಗಿ ಅಧಿಕೃತ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು:\n\n` +
            primary.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
            `\n\nಅಧಿಕೃತ ಅರ್ಜಿ ವೆಬ್‌ಸೈಟ್: ${primary.applicationProcedure.onlineUrl || primary.officialWebsite}`,
          suggestedSchemes: suggested,
          language: 'kn',
          modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
        };
      }
      return {
        reply: `**${name}** (${primary.department}):\n\n${desc}\n\n**ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು:**\n` +
          primary.benefits.map(b => `• ${b}`).join('\n') +
          `\n\nಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${primary.officialWebsite}`,
        suggestedSchemes: suggested,
        language: 'kn',
        modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
      };
    }

    if (lang === 'hi') {
      if (isDocQuery) {
        return {
          reply: `**${name}** के लिए आवश्यक आधिकारिक दस्तावेज:\n\n` +
            primary.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join('\n') +
            `\n\nआधिकारिक पोर्टल: ${primary.officialWebsite}`,
          suggestedSchemes: suggested,
          language: 'hi',
          modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
        };
      }
      if (isApplyQuery) {
        return {
          reply: `**${name}** के लिए आवेदन करने की प्रक्रिया:\n\n` +
            primary.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
            `\n\nआधिकारिक पोर्टल: ${primary.applicationProcedure.onlineUrl || primary.officialWebsite}`,
          suggestedSchemes: suggested,
          language: 'hi',
          modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
        };
      }
      return {
        reply: `**${name}** (${primary.department}):\n\n${desc}\n\n**प्रमुख लाभ:**\n` +
          primary.benefits.map(b => `• ${b}`).join('\n') +
          `\n\nआधिकारिक लिंक: ${primary.officialWebsite}`,
        suggestedSchemes: suggested,
        language: 'hi',
        modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
      };
    }

    // Default English
    if (isDocQuery) {
      return {
        reply: `Here are the official required documents for **${name}**:\n\n` +
          primary.requiredDocuments.map((d, i) => `${i + 1}. **${d}**`).join('\n') +
          `\n\nOfficial Portal: ${primary.officialWebsite}`,
        suggestedSchemes: suggested,
        language: 'en',
        modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
      };
    }
    if (isApplyQuery) {
      return {
        reply: `Here is the official application procedure for **${name}**:\n\n` +
          primary.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n') +
          `\n\nOfficial Portal: ${primary.applicationProcedure.onlineUrl || primary.officialWebsite}`,
        suggestedSchemes: suggested,
        language: 'en',
        modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
      };
    }

    return {
      reply: `**${name}** (${primary.department})\n\n${desc}\n\n` +
        `**Key Benefits:**\n` + primary.benefits.map(b => `• ${b}`).join('\n') + '\n\n' +
        `**Eligibility Criteria:**\n` + primary.eligibilityCriteria.rules.map(r => `• ${r}`).join('\n') + '\n\n' +
        `Official Portal: ${primary.officialWebsite}`,
      suggestedSchemes: suggested,
      language: 'en',
      modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
    };
  }

  // General conversational greeting fallback
  if (qLower.match(/^(hi|hello|hey|namaste|namaskara|good\s+morning|good\s+afternoon|good\s+evening)\b/)) {
    return {
      reply: lang === 'kn'
        ? "ನಮಸ್ಕಾರ! ನಾನು ಜನಸೇವಾ ಅಧಿಕಾರಿ ಸಹಾಯಕ. ಇಂದು ನಿಮಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆ, ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಸೇವೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು?"
        : lang === 'hi'
          ? "नमस्ते! मैं जनसेवा सहायक हूँ। आज मैं आपको किस सरकारी योजना, प्रमाण पत्र या सार्वजनिक सेवा की जानकारी प्रदान करूँ?"
          : "Hello! I am your Janaseva Support Assistant. Which government scheme, eligibility rule, or citizen service can I help you with today?",
      suggestedSchemes: allSchemes.slice(0, 3).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        slug: s.slug,
        officialWebsite: s.officialWebsite
      })),
      language: lang,
      modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
    };
  }

  return {
    reply: lang === 'kn'
      ? "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ಯೋಜನೆ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೃಹ ಲಕ್ಷ್ಮಿ, ಶಕ್ತಿ ಯೋಜನೆ, ಪಿಎಂ ಕಿಸಾನ್, ಎಸ್‌ಎಸ್‌ಪಿ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅಥವಾ ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಬಗ್ಗೆ ಕೇಳಿ."
      : lang === 'hi'
        ? "क्षमा करें, इस प्रश्न से जुड़ी सटीक योजना नहीं मिली। कृपया गृह लक्ष्मी, शक्ति योजना, पीएम-किसान, एसएसपी छात्रवृत्ति या आयुष्मान भारत के बारे में पूछें।"
        : "I could not find an exact match for your query. You can ask me about verified welfare programs like Gruha Lakshmi, PM-KISAN, SSP Scholarship, Shakti Scheme, or Ayushman Bharat.",
    suggestedSchemes: allSchemes.slice(0, 3).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      slug: s.slug,
      officialWebsite: s.officialWebsite
    })),
    language: 'en',
    modelUsed: 'Janaseva Rule Engine (Offline Fallback)'
  };
}

/**
 * Main Assistant Query Processor with Speech Correction, OpenRouter LLM & Multi-Turn Memory
 */
export async function processAssistantQuery(
  rawQuery: string,
  langHint?: string,
  history: ChatMessage[] = []
): Promise<AssistantResponse> {
  // 1. Normalize speech recognition mistakes
  const normalizedQuery = normalizeSpeechQuery(rawQuery);

  // 2. Multi-language detection
  const detected = detectLanguage(normalizedQuery);
  const lang = (detected !== 'en') ? detected : ((langHint as SupportedLanguage) || 'en');

  const qLower = normalizedQuery.toLowerCase();
  const allSchemes = db.getSchemes().filter(s => s.isPublished);

  // 3. Identify Scheme Matches for Grounding Context
  const matchedSchemes: Scheme[] = [];

  for (const scheme of allSchemes) {
    const sName = scheme.name.toLowerCase();
    const sSlug = scheme.slug.toLowerCase();

    if (
      qLower.includes(sName) ||
      qLower.includes(sSlug) ||
      (qLower.includes('gruha') && sSlug.includes('gruha')) ||
      (qLower.includes('shakti') && sSlug.includes('shakti')) ||
      (qLower.includes('ssp') && sSlug.includes('ssp')) ||
      (qLower.includes('nsp') && sSlug.includes('nsp')) ||
      (qLower.includes('kisan') && sSlug.includes('kisan')) ||
      (qLower.includes('fasal') && sSlug.includes('fasal')) ||
      (qLower.includes('bima') && sSlug.includes('fasal')) ||
      (qLower.includes('ayushman') && sSlug.includes('ayushman')) ||
      (qLower.includes('svanidhi') && sSlug.includes('svanidhi')) ||
      (qLower.includes('yuva') && sSlug.includes('yuva')) ||
      (qLower.includes('mudra') && sSlug.includes('mudra')) ||
      (qLower.includes('ladki') && sSlug.includes('ladki')) ||
      (qLower.includes('magalir') && sSlug.includes('magalir')) ||
      (qLower.includes('rythu') && sSlug.includes('rythu')) ||
      (qLower.includes('kanya') && sSlug.includes('kanya')) ||
      (qLower.includes('pmay') && sSlug.includes('pmay')) ||
      (qLower.includes('awas') && sSlug.includes('pmay'))
    ) {
      matchedSchemes.push(scheme);
    }
  }

  // Category matching fallback if no specific scheme found
  if (matchedSchemes.length === 0) {
    if (qLower.includes('farmer') || qLower.includes('kisan') || qLower.includes('ರೈತ') || qLower.includes('किसान') || qLower.includes('agriculture')) {
      matchedSchemes.push(...allSchemes.filter(s => s.category === 'Farmer Welfare'));
    } else if (qLower.includes('women') || qLower.includes('girl') || qLower.includes('female') || qLower.includes('ಮಹಿಳೆ') || qLower.includes('महिला')) {
      matchedSchemes.push(...allSchemes.filter(s => s.category === 'Women Empowerment'));
    } else if (qLower.includes('student') || qLower.includes('scholarship') || qLower.includes('ವಿದ್ಯಾರ್ಥಿ') || qLower.includes('छात्र') || qLower.includes('college')) {
      matchedSchemes.push(...allSchemes.filter(s => s.category === 'Student Scholarships'));
    } else if (qLower.includes('health') || qLower.includes('hospital') || qLower.includes('ಆರೋಗ್ಯ') || qLower.includes('स्वास्थ्य') || qLower.includes('medical')) {
      matchedSchemes.push(...allSchemes.filter(s => s.category === 'Health and Social Welfare'));
    } else if (qLower.includes('loan') || qLower.includes('business') || qLower.includes('vendor') || qLower.includes('ಸಾಲ') || qLower.includes('ऋण')) {
      matchedSchemes.push(...allSchemes.filter(s => s.category === 'Financial Assistance' || s.category === 'Employment Opportunities'));
    }
  }

  const suggested = (matchedSchemes.length > 0 ? matchedSchemes : allSchemes).slice(0, 3).map(s => ({
    id: s.id,
    name: lang === 'kn' ? (s.name_kn || s.name) : lang === 'hi' ? (s.name_hi || s.name) : s.name,
    category: s.category,
    slug: s.slug,
    officialWebsite: s.officialWebsite
  }));

  // 4. Query OpenRouter AI with Grounded Context & Multi-Turn History
  const openRouterResult = await callOpenRouter(
    normalizedQuery,
    lang,
    matchedSchemes.length > 0 ? matchedSchemes : allSchemes,
    history
  );

  if (openRouterResult && openRouterResult.text) {
    return {
      reply: openRouterResult.text,
      suggestedSchemes: suggested,
      language: lang,
      modelUsed: `OpenRouter AI (${openRouterResult.model})`
    };
  }

  // 5. Fallback to Deterministic Expert Engine
  return getDeterministicFallback(normalizedQuery, lang, matchedSchemes, suggested, allSchemes);
}
