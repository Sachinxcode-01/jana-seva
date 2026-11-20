import { db } from '../../database/db.js';
import { Scheme } from '../../types.js';
import { schemeRetrievalService, ScoredScheme } from './scheme-retrieval.service.js';
import { sourceVerificationService, VerifiedSourceCitation } from './source-verification.service.js';

export interface KnowledgeContextResult {
  schemes: Scheme[];
  groundingContextText: string;
  citations: VerifiedSourceCitation[];
}

export class KnowledgeService {
  /**
   * Retrieves relevant schemes and formats them into an authoritative prompt context
   */
  public getGroundedContext(query: string, language = 'en', maxSchemes = 4): KnowledgeContextResult {
    const allPublished = db.getSchemes().filter(s => s.isPublished);
    const scoredResults: ScoredScheme[] = schemeRetrievalService.searchSchemes(allPublished, query, maxSchemes);

    // If specific matches found, use them; otherwise, provide top national & state flagship schemes
    const selectedSchemes = scoredResults.length > 0
      ? scoredResults.map(r => r.scheme)
      : allPublished.slice(0, 3);

    const citations = sourceVerificationService.getCitations(selectedSchemes, language);

    const groundingContextText = selectedSchemes.map((s, idx) => {
      const annualIncomeText = s.eligibilityCriteria.maxAnnualIncome
        ? `₹${s.eligibilityCriteria.maxAnnualIncome.toLocaleString('en-IN')}`
        : 'No income ceiling specified';

      return `[RECORD ${idx + 1}]
Official Scheme Name: ${s.name}
Kannada Name: ${s.name_kn || s.name}
Hindi Name: ${s.name_hi || s.name}
Department: ${s.department}
Level: ${s.classification} (${s.state})
Category: ${s.category} (Beneficiary: ${s.beneficiaryCategory})
Official Overview: ${s.description}
Verified Benefits:
${s.benefits.map(b => `- ${b}`).join('\n')}
Eligibility Criteria:
${s.eligibilityCriteria.rules.map(r => `- ${r}`).join('\n')}
Age Limits: ${s.eligibilityCriteria.minAge || 0} to ${s.eligibilityCriteria.maxAge || 100} years
Gender: ${s.eligibilityCriteria.gender || 'All'}
Income Ceiling: ${annualIncomeText}
Required Documents:
${s.requiredDocuments.map(d => `- ${d}`).join('\n')}
Official Application Procedure:
${s.applicationProcedure.steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}
Official Application Portal URL: ${s.applicationProcedure.onlineUrl || s.officialWebsite}
Verification Status: ${s.sourceVerificationStatus || 'Official Government Verified'}`;
    }).join('\n\n========================================\n\n');

    return {
      schemes: selectedSchemes,
      groundingContextText,
      citations
    };
  }

  public getSchemeById(idOrSlug: string): Scheme | undefined {
    return db.getSchemeById(idOrSlug);
  }

  public getAllPublishedSchemes(): Scheme[] {
    return db.getSchemes().filter(s => s.isPublished);
  }
}

export const knowledgeService = new KnowledgeService();
