import { Scheme } from '../../types.js';

export interface ScoredScheme {
  scheme: Scheme;
  score: number;
  matchedFields: string[];
}

// Multilingual phonetic and vernacular aliases mapping to canonical schemes
const SCHEME_ALIASES: Record<string, string[]> = {
  'gruha-lakshmi-yojana': [
    'gruha lakshmi', 'griha lakshmi', 'grihalakshmi', 'gruhalakshmi',
    'ಗೃಹ ಲಕ್ಷ್ಮಿ', 'ಗೃಹಲಕ್ಷ್ಮಿ', 'गृह लक्ष्मी', 'गृहलक्ष्मी', 'women 2000', '2000 scheme', 'woman head 2000'
  ],
  'shakti-scheme-karnataka': [
    'shakti', 'shakthi', 'free bus', 'shakti bus', 'women bus pass',
    'ಶಕ್ತಿ ಯೋಜನೆ', 'ಶಕ್ತಿ ಬಸ್', 'शक्ति योजना', 'शक्ति बस', 'free bus travel'
  ],
  'pm-kisan-samman-nidhi': [
    'pm kisan', 'pm-kisan', 'kisan samman', '6000 kisan', 'farmer 6000',
    'ಪಿಎಂ ಕಿಸಾನ್', 'ಕಿಸಾನ್ ಸಮ್ಮಾನ್', 'पीएम किसान', 'किसान सम्मान', 'kisan yojana'
  ],
  'ssp-post-matric-scholarship': [
    'ssp', 'ssp scholarship', 'post matric', 'state scholarship portal', 'fee concession',
    'ಎಸ್‌ಎಸ್‌ಪಿ', 'ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ', 'एसएसपी', 'छात्रवृत्ति'
  ],
  'yuva-nidhi-scheme': [
    'yuva nidhi', 'yuvanidhi', 'unemployment allowance', 'graduate allowance',
    'ಯುವ ನಿಧಿ', 'ಯುವನಿಧಿ', 'युवा निधि', 'युवानिधि', 'diploma allowance'
  ],
  'anna-bhagya-scheme': [
    'anna bhagya', 'annabhagya', 'free rice', 'dbt rice', 'bpl rice',
    'ಅನ್ನ ಭಾಗ್ಯ', 'ಅನ್ನಭಾಗ್ಯ', 'अन्न भाग्य', 'अन्नभाग्य'
  ],
  'gruha-jyothi-scheme': [
    'gruha jyoti', 'gruha jyothi', 'gruhajyoti', 'free power', '200 units',
    'ಗೃಹ ಜ್ಯೋತಿ', 'ಗೃಹಜ್ಯೋತಿ', 'गृह ज्योति', 'गृहज्योति', 'free electricity'
  ],
  'ayushman-bharat-pmjay': [
    'ayushman', 'pmjay', 'golden card', 'health card 5 lakh', 'arogya karnataka',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್', 'ಆರೋಗ್ಯ ಕರ್ನಾಟಕ', 'आयुष्मान भारत', 'गोल्डन कार्ड'
  ],
  'pm-svanidhi-scheme': [
    'svanidhi', 'street vendor', 'vendor loan', 'pmsvanidhi',
    'ಸ್ವನಿಧಿ', 'ಬೀದಿ ವ್ಯಾಪಾರಿ', 'स्वनिधि', 'रेहड़ी पटरी'
  ],
  'pradhan-mantri-mudra-yojana': [
    'mudra', 'mudra loan', 'shishu loan', 'kishore loan', 'tarun loan',
    'ಮುದ್ರಾ ಯೋಜನೆ', 'मुद्रा योजना'
  ]
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Farmer Welfare': ['farmer', 'kisan', 'agriculture', 'crop', 'land', 'bhoomi', 'raitha', 'ರೈತ', 'ಕೃಷಿ', 'किसान', 'खेती', 'krishi'],
  'Women Empowerment': ['women', 'female', 'girl', 'mother', 'widow', 'mahila', 'ಮಹಿಳೆ', 'ಹೆಣ್ಣು', 'महिला', 'नारी'],
  'Student Scholarships': ['student', 'scholarship', 'college', 'school', 'matric', 'fees', 'ವಿದ್ಯಾರ್ಥಿ', 'ವಿದ್ಯಾರ್ಥಿವೇತನ', 'छात्र', 'छात्रवृत्ति'],
  'Health and Social Welfare': ['health', 'hospital', 'medical', 'treatment', 'disease', 'ಆರೋಗ್ಯ', 'ಆಸ್ಪತ್ರೆ', 'स्वास्थ्य', 'इलाज'],
  'Employment Opportunities': ['job', 'employment', 'unemployed', 'youth', 'allowance', 'ಉದ್ಯೋಗ', 'ನಿರುದ್ಯೋಗಿ', 'रोजगार', 'बेरोजगार'],
  'Financial Assistance': ['loan', 'subsidy', 'grant', 'credit', 'bank', 'finance', 'ಸಾಲ', 'ಸಹಾಯಧನ', 'ऋण', 'सब्सिडी']
};

export class SchemeRetrievalService {
  /**
   * Scores and ranks schemes based on query tokens, aliases, and category indicators
   */
  public searchSchemes(allSchemes: Scheme[], query: string, limit = 5): ScoredScheme[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const scored: ScoredScheme[] = [];

    for (const scheme of allSchemes) {
      if (!scheme.isPublished) continue;

      let score = 0;
      const matchedFields: string[] = [];
      const slug = scheme.slug.toLowerCase();
      const name = scheme.name.toLowerCase();
      const nameKn = (scheme.name_kn || '').toLowerCase();
      const nameHi = (scheme.name_hi || '').toLowerCase();

      // 1. Direct name / slug matching (Highest priority)
      if (q.includes(slug) || q.includes(name)) {
        score += 100;
        matchedFields.push('name_exact');
      }

      // 2. Multilingual aliases matching
      const aliases = SCHEME_ALIASES[scheme.slug] || [];
      for (const alias of aliases) {
        if (q.includes(alias.toLowerCase())) {
          score += 80;
          matchedFields.push(`alias:${alias}`);
          break;
        }
      }

      // 3. Vernacular name matching
      if (nameKn && q.includes(nameKn)) {
        score += 90;
        matchedFields.push('name_kn');
      }
      if (nameHi && q.includes(nameHi)) {
        score += 90;
        matchedFields.push('name_hi');
      }

      // 4. Category keywords matching
      const catKeywords = CATEGORY_KEYWORDS[scheme.category] || [];
      for (const kw of catKeywords) {
        if (q.includes(kw)) {
          score += 25;
          matchedFields.push(`category:${kw}`);
          break;
        }
      }

      // 5. Benefits & Eligibility rules scan
      const rulesText = (scheme.eligibilityCriteria.rules || []).join(' ').toLowerCase();
      const docsText = (scheme.requiredDocuments || []).join(' ').toLowerCase();
      const descText = (scheme.description || '').toLowerCase();

      if (q.includes('document') || q.includes('proof') || q.includes('ದಾಖಲೆ') || q.includes('दस्तावेज')) {
        if (matchedFields.length > 0) score += 15;
      }

      if (q.includes('apply') || q.includes('procedure') || q.includes('ಅರ್ಜಿ') || q.includes('आवेदन')) {
        if (matchedFields.length > 0) score += 15;
      }

      if (q.includes('eligible') || q.includes('eligibility') || q.includes('ಅರ್ಹತೆ') || q.includes('पात्रता')) {
        if (matchedFields.length > 0) score += 15;
      }

      // Token overlap scoring
      const tokens = q.split(/\s+/).filter(t => t.length > 2);
      let tokenMatches = 0;
      for (const token of tokens) {
        if (descText.includes(token) || rulesText.includes(token) || docsText.includes(token)) {
          tokenMatches++;
        }
      }
      if (tokenMatches > 0) {
        score += Math.min(tokenMatches * 5, 25);
        matchedFields.push(`tokens:${tokenMatches}`);
      }

      if (score > 0) {
        scored.push({ scheme, score, matchedFields });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}

export const schemeRetrievalService = new SchemeRetrievalService();
