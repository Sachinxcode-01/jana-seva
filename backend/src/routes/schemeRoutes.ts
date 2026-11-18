import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';

const router = Router();

// GET /api/schemes
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      q, 
      category, 
      classification, 
      state, 
      beneficiary, 
      department,
      sortBy 
    } = req.query;

    let schemes = db.getSchemes().filter(s => s.isPublished);

    // Search query by name, description, benefits, department
    if (q && typeof q === 'string') {
      const term = q.toLowerCase().trim();
      schemes = schemes.filter(s => 
        s.name.toLowerCase().includes(term) ||
        (s.name_kn && s.name_kn.toLowerCase().includes(term)) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(term)) ||
        s.description.toLowerCase().includes(term) ||
        s.department.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
      );
    }

    // Filter by Category
    if (category && typeof category === 'string' && category !== 'All') {
      schemes = schemes.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Classification (Central vs State)
    if (classification && typeof classification === 'string' && classification !== 'All') {
      schemes = schemes.filter(s => s.classification.toLowerCase() === classification.toLowerCase());
    }

    // Filter by State
    if (state && typeof state === 'string' && state !== 'All') {
      schemes = schemes.filter(s => s.state.toLowerCase() === state.toLowerCase() || s.state === 'All India');
    }

    // Filter by Beneficiary Category
    if (beneficiary && typeof beneficiary === 'string' && beneficiary !== 'All') {
      schemes = schemes.filter(s => 
        s.beneficiaryCategory.toLowerCase() === beneficiary.toLowerCase() ||
        s.beneficiaryCategory === 'General'
      );
    }

    // Filter by Department
    if (department && typeof department === 'string' && department !== 'All') {
      schemes = schemes.filter(s => s.department.toLowerCase().includes(department.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'popular') {
      schemes.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === 'name') {
      schemes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: recently updated
      schemes.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return res.json({
      success: true,
      total: schemes.length,
      schemes
    });
  } catch (err) {
    console.error('Error fetching schemes:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving schemes.' });
  }
});

// GET /api/schemes/categories/summary
router.get('/categories/summary', (_req: Request, res: Response) => {
  const schemes = db.getSchemes().filter(s => s.isPublished);
  const categories: Record<string, number> = {
    'Women Empowerment': 0,
    'Student Scholarships': 0,
    'Farmer Welfare': 0,
    'Employment Opportunities': 0,
    'Financial Assistance': 0,
    'Health and Social Welfare': 0
  };

  for (const s of schemes) {
    if (categories[s.category] !== undefined) {
      categories[s.category]++;
    }
  }

  return res.json({
    success: true,
    categories: Object.entries(categories).map(([name, count]) => ({ name, count }))
  });
});

// GET /api/schemes/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const scheme = db.getSchemeByIdOrSlug(idOrSlug);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    // Increment view count
    db.incrementViewCount(scheme.id);

    // Find related schemes (same category, different scheme)
    const related = db.getSchemes()
      .filter(s => s.category === scheme.category && s.id !== scheme.id && s.isPublished)
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        category: s.category,
        classification: s.classification,
        benefits: s.benefits.slice(0, 2)
      }));

    return res.json({
      success: true,
      scheme,
      related
    });
  } catch (err) {
    console.error('Error retrieving scheme:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving scheme details.' });
  }
});

export default router;
