import { apiClient } from './apiClient';
import { Scheme } from '../types';
import { ALL_VERIFIED_SCHEMES as FALLBACK_SCHEMES } from './schemesData';

export interface SchemeQueryParams {
  q?: string;
  category?: string;
  classification?: string;
  state?: string;
  beneficiary?: string;
  department?: string;
  sortBy?: string;
}

export const schemeService = {
  async getSchemes(params?: SchemeQueryParams): Promise<{ success: boolean; total: number; schemes: Scheme[] }> {
    try {
      const res = await apiClient.get('/schemes', { params });
      if (res.data?.success && Array.isArray(res.data.schemes)) {
        return res.data;
      }
    } catch (e) {
      console.warn('[schemeService] Backend unavailable, using client-side fallback:', e);
    }

    // Client-side fallback filtered against certified dataset
    let list = [...FALLBACK_SCHEMES];
    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.name_kn && s.name_kn.toLowerCase().includes(q)) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    if (params?.category && params.category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.classification && params.classification !== 'All') {
      list = list.filter(s => s.classification.toLowerCase() === params.classification!.toLowerCase());
    }
    if (params?.state && params.state !== 'All') {
      list = list.filter(s => s.state.toLowerCase() === params.state!.toLowerCase() || s.state === 'All India');
    }
    return { success: true, total: list.length, schemes: list };
  },

  async getSchemeById(idOrSlug: string): Promise<{ success: boolean; scheme: Scheme; related?: Scheme[] }> {
    try {
      const res = await apiClient.get(`/schemes/${idOrSlug}`);
      if (res.data?.success && res.data.scheme) {
        return res.data;
      }
    } catch (e) {
      console.warn('[schemeService] Backend detail fetch error, finding in fallback schemes:', e);
    }

    const found = FALLBACK_SCHEMES.find(s => s.id === idOrSlug || s.slug === idOrSlug);
    if (found) {
      const related = FALLBACK_SCHEMES.filter(s => s.category === found.category && s.id !== found.id).slice(0, 3);
      return { success: true, scheme: found, related };
    }
    return { success: false, scheme: null as any };
  },

  async getCategories(): Promise<{ success: boolean; categories: { name: string; count: number }[] }> {
    try {
      const res = await apiClient.get('/schemes/categories');
      if (res.data?.success) {
        return res.data;
      }
    } catch {
      // Fallback count calculation
    }
    const categories: Record<string, number> = {};
    for (const s of FALLBACK_SCHEMES) {
      categories[s.category] = (categories[s.category] || 0) + 1;
    }
    return {
      success: true,
      categories: Object.entries(categories).map(([name, count]) => ({ name, count }))
    };
  },

  async getSchemeDocuments(idOrSlug: string): Promise<{ success: boolean; schemeId: string; schemeName: string; requiredDocuments: string[] }> {
    try {
      const res = await apiClient.get(`/schemes/${idOrSlug}/documents`);
      return res.data;
    } catch {
      const found = FALLBACK_SCHEMES.find(s => s.id === idOrSlug || s.slug === idOrSlug);
      return {
        success: Boolean(found),
        schemeId: found?.id || idOrSlug,
        schemeName: found?.name || '',
        requiredDocuments: found?.requiredDocuments || []
      };
    }
  }
};
