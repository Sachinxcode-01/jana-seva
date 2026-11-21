import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.js';
import { Scheme } from '../types.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

// GET /api/admin/metrics, /api/admin/dashboard, /api/admin/analytics
router.get(['/metrics', '/dashboard', '/analytics'], (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers();
    const schemes = db.getSchemes();
    const logs = db.getAdminLogs();

    // Schemes by Category for Recharts Bar/Pie
    const categoryCounts: Record<string, number> = {};
    for (const s of schemes) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
    const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
      category: name,
      count
    }));

    // Most Viewed Schemes for Recharts Bar Chart
    const mostViewed = [...schemes]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.name.length > 20 ? s.name.substring(0, 18) + '...' : s.name,
        views: s.viewCount || 0
      }));

    // Central vs State Distribution
    const classificationCounts = {
      Central: schemes.filter(s => s.classification === 'Central').length,
      State: schemes.filter(s => s.classification === 'State').length
    };

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        citizenCount: users.filter(u => u.role === 'citizen').length,
        adminCount: users.filter(u => u.role === 'admin').length,
        totalSchemes: schemes.length,
        publishedSchemes: schemes.filter(s => s.isPublished).length,
        verifiedSchemes: schemes.filter(s => s.isVerified).length,
        totalViews: schemes.reduce((acc, s) => acc + (s.viewCount || 0), 0)
      },
      categoryChartData,
      mostViewed,
      classificationCounts,
      recentLogs: logs.slice(0, 10)
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving metrics.' });
  }
});

// GET /api/admin/schemes (Full catalog for administration)
router.get('/schemes', (_req: AuthenticatedRequest, res: Response) => {
  const schemes = db.getSchemes();
  return res.json({ success: true, count: schemes.length, schemes });
});

// POST /api/admin/schemes
router.post('/schemes', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const schemeData = req.body;
    const desc = schemeData.description || schemeData.detailedDescription || schemeData.briefDescription;

    if (!schemeData.name || !schemeData.department || !schemeData.category || !desc) {
      return res.status(400).json({ success: false, message: 'Name, department, category, and description are required.' });
    }

    const slug = schemeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newScheme: Scheme = {
      id: `scheme-${Date.now()}`,
      slug,
      name: schemeData.name,
      name_kn: schemeData.name_kn || schemeData.name,
      name_hi: schemeData.name_hi || schemeData.name,
      department: schemeData.department,
      classification: schemeData.classification || schemeData.level || 'Central',
      state: schemeData.state || 'All India',
      category: schemeData.category,
      beneficiaryCategory: schemeData.beneficiaryCategory || 'General',
      description: desc,
      description_kn: schemeData.description_kn || desc,
      description_hi: schemeData.description_hi || desc,
      benefits: Array.isArray(schemeData.benefits) ? schemeData.benefits : [schemeData.benefits || 'Financial assistance'],
      eligibilityCriteria: schemeData.eligibilityCriteria || { rules: ['Indian Citizen'] },
      requiredDocuments: Array.isArray(schemeData.requiredDocuments) ? schemeData.requiredDocuments : ['Aadhaar Card'],
      applicationProcedure: schemeData.applicationProcedure || {
        steps: ['Visit official website', 'Submit application'],
        onlineUrl: schemeData.officialWebsite || schemeData.applicationUrl || 'https://india.gov.in',
        offlineModeAvailable: true
      },
      officialWebsite: schemeData.officialWebsite || schemeData.applicationUrl || 'https://india.gov.in',
      officialSourceUrl: schemeData.officialSourceUrl || schemeData.officialWebsite || schemeData.applicationUrl || 'https://india.gov.in',
      deadline: schemeData.deadline || 'Ongoing / No fixed deadline',
      lastUpdated: new Date().toISOString().split('T')[0],
      isVerified: schemeData.isVerified !== undefined ? Boolean(schemeData.isVerified) : true,
      isPublished: schemeData.isPublished !== undefined ? Boolean(schemeData.isPublished) : true,
      isArchived: false,
      verifiedBy: admin.email,
      viewCount: 0,
      sourceVerificationStatus: 'Official Government Verified'
    };

    db.createScheme(newScheme);

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: 'ADD_SCHEME',
      target: newScheme.name,
      details: `Added new scheme under ${newScheme.category} (${newScheme.classification})`,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme: newScheme });
  } catch (err) {
    console.error('Error creating scheme:', err);
    return res.status(500).json({ success: false, message: 'Server error creating scheme.' });
  }
});

// POST /api/admin/schemes/bulk-import
router.post('/schemes/bulk-import', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const rawList = Array.isArray(req.body) ? req.body : req.body.schemes;

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload. An array of schemes is required.' });
    }

    const validatedSchemes: Scheme[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item.name) continue;

      const desc = item.description || item.detailedDescription || item.briefDescription || 'Government welfare initiative';
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = item.id || `scheme-${timestamp}-${i}`;

      const scheme: Scheme = {
        id,
        slug,
        name: item.name,
        name_kn: item.name_kn || item.name,
        name_hi: item.name_hi || item.name,
        department: item.department || 'Government Department',
        classification: item.classification === 'State' ? 'State' : 'Central',
        state: item.state || (item.classification === 'State' ? 'Karnataka' : 'All India'),
        category: item.category || 'Financial Assistance',
        beneficiaryCategory: item.beneficiaryCategory || 'General',
        description: desc,
        description_kn: item.description_kn || desc,
        description_hi: item.description_hi || desc,
        benefits: Array.isArray(item.benefits) ? item.benefits : [item.benefits || 'Welfare benefit'],
        eligibilityCriteria: item.eligibilityCriteria || {
          minAge: Number(item.minAge) || undefined,
          maxAge: Number(item.maxAge) || undefined,
          maxAnnualIncome: Number(item.incomeLimit || item.maxAnnualIncome) || undefined,
          rules: ['Resident Indian Citizen']
        },
        requiredDocuments: Array.isArray(item.requiredDocuments)
          ? item.requiredDocuments
          : (typeof item.requiredDocuments === 'string' ? item.requiredDocuments.split(';').map((d: string) => d.trim()).filter(Boolean) : ['Aadhaar Card']),
        applicationProcedure: item.applicationProcedure || {
          steps: ['Visit official website', 'Submit application'],
          onlineUrl: item.officialWebsite || item.applicationUrl || 'https://india.gov.in',
          offlineModeAvailable: true
        },
        officialWebsite: item.officialWebsite || item.applicationUrl || 'https://india.gov.in',
        officialSourceUrl: item.officialSourceUrl || item.officialWebsite || 'https://india.gov.in',
        deadline: item.deadline || 'Ongoing / No fixed deadline',
        lastUpdated: new Date().toISOString().split('T')[0],
        isVerified: item.isVerified !== undefined ? Boolean(item.isVerified) : true,
        isPublished: item.isPublished !== undefined ? Boolean(item.isPublished) : true,
        isArchived: Boolean(item.isArchived),
        verifiedBy: admin.email,
        viewCount: Number(item.viewCount) || 0,
        sourceVerificationStatus: 'Official Government Verified'
      };

      validatedSchemes.push(scheme);
    }

    if (validatedSchemes.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid scheme records found in payload.' });
    }

    const result = db.bulkUpsertSchemes(validatedSchemes);

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: 'BULK_IMPORT_SCHEMES',
      target: `${result.created} created, ${result.updated} updated`,
      details: `Bulk imported ${validatedSchemes.length} schemes into directory`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Bulk import successful: ${result.created} new schemes created, ${result.updated} existing schemes updated.`,
      created: result.created,
      updated: result.updated,
      total: result.total
    });
  } catch (err) {
    console.error('Error during bulk import:', err);
    return res.status(500).json({ success: false, message: 'Server error processing bulk import.' });
  }
});

// GET /api/admin/schemes/export
router.get('/schemes/export', (req: AuthenticatedRequest, res: Response) => {
  try {
    const format = (req.query.format as string) || 'json';
    const schemes = db.getSchemes();

    if (format === 'csv') {
      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = [
        'ID',
        'Name',
        'Name (Kannada)',
        'Name (Hindi)',
        'Department',
        'Classification',
        'State',
        'Category',
        'Target Beneficiary',
        'Description',
        'Benefits',
        'Required Documents',
        'Official Website',
        'Deadline',
        'Is Published',
        'Is Verified'
      ];

      const rows = schemes.map(s => [
        escapeCsv(s.id),
        escapeCsv(s.name),
        escapeCsv(s.name_kn || ''),
        escapeCsv(s.name_hi || ''),
        escapeCsv(s.department),
        escapeCsv(s.classification),
        escapeCsv(s.state),
        escapeCsv(s.category),
        escapeCsv(s.beneficiaryCategory || ''),
        escapeCsv(s.description),
        escapeCsv(Array.isArray(s.benefits) ? s.benefits.join('; ') : s.benefits),
        escapeCsv(Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join('; ') : s.requiredDocuments),
        escapeCsv(s.officialWebsite),
        escapeCsv(s.deadline || ''),
        escapeCsv(s.isPublished ? 'Yes' : 'No'),
        escapeCsv(s.isVerified ? 'Yes' : 'No')
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=janaseva-schemes-${new Date().toISOString().split('T')[0]}.csv`);
      return res.status(200).send(csvContent);
    }

    return res.json({
      success: true,
      count: schemes.length,
      exportedAt: new Date().toISOString(),
      schemes
    });
  } catch (err) {
    console.error('Error exporting schemes:', err);
    return res.status(500).json({ success: false, message: 'Server error exporting schemes.' });
  }
});

// PUT /api/admin/schemes/:id
router.put('/schemes/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const id = String(req.params.id);
    const updates = req.body;

    const updated = db.updateScheme(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: 'UPDATE_SCHEME',
      target: updated.name,
      details: `Updated parameters for scheme ${id}`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Scheme updated.', scheme: updated });
  } catch (err) {
    console.error('Error updating scheme:', err);
    return res.status(500).json({ success: false, message: 'Server error updating scheme.' });
  }
});

// DELETE /api/admin/schemes/:id
router.delete('/schemes/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const id = String(req.params.id);
    const existing = db.getSchemeByIdOrSlug(id);

    const deleted = db.deleteScheme(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: 'DELETE_SCHEME',
      target: existing?.name || id,
      details: `Deleted scheme record ${id}`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Scheme deleted successfully.' });
  } catch (err) {
    console.error('Error deleting scheme:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting scheme.' });
  }
});

// PATCH /api/admin/schemes/:id/publish
router.patch('/schemes/:id/publish', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const id = String(req.params.id);
    const existing = db.getSchemeByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    const isPublished = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : !existing.isPublished;
    const updated = db.updateScheme(existing.id, { isPublished });

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: isPublished ? 'PUBLISH_SCHEME' : 'UNPUBLISH_SCHEME',
      target: existing.name,
      details: `${isPublished ? 'Published' : 'Unpublished'} scheme ${existing.id}`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Scheme ${isPublished ? 'published' : 'unpublished'} successfully.`,
      scheme: updated
    });
  } catch (err) {
    console.error('Error updating scheme publish status:', err);
    return res.status(500).json({ success: false, message: 'Server error updating publication status.' });
  }
});

// PATCH /api/admin/schemes/:id/archive
router.patch('/schemes/:id/archive', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const id = String(req.params.id);
    const existing = db.getSchemeByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    const isArchived = req.body.isArchived !== undefined ? Boolean(req.body.isArchived) : !existing.isArchived;
    const updated = db.archiveScheme(existing.id, isArchived);

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: isArchived ? 'ARCHIVE_SCHEME' : 'UNARCHIVE_SCHEME',
      target: existing.name,
      details: `${isArchived ? 'Archived' : 'Restored'} scheme ${existing.id}`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Scheme ${isArchived ? 'archived' : 'restored'} successfully.`,
      scheme: updated
    });
  } catch (err) {
    console.error('Error updating scheme archive status:', err);
    return res.status(500).json({ success: false, message: 'Server error updating archive status.' });
  }
});

// GET /api/admin/users
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    mobileNumber: u.mobileNumber,
    role: u.role,
    state: u.state,
    district: u.district,
    occupation: u.occupation,
      incomeRange: u.incomeRange,
    beneficiaryCategory: u.beneficiaryCategory,
    accountStatus: u.accountStatus || 'active',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }));
  return res.json({ success: true, count: users.length, users });
});

// GET /api/admin/users/:id
router.get('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(String(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  return res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      state: user.state,
      district: user.district,
      villageTown: user.villageTown,
      occupation: user.occupation,
      incomeRange: user.incomeRange,
      beneficiaryCategory: user.beneficiaryCategory,
      preferredLanguage: user.preferredLanguage,
      accountStatus: user.accountStatus || 'active',
      documentsCount: user.documents?.length || 0,
      sessionsCount: user.sessions?.length || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const admin = req.user!;
    const userId = String(req.params.id);
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: "Valid status must be 'active' or 'suspended'." });
    }

    if (admin.id === userId && status === 'suspended') {
      return res.status(400).json({ success: false, message: 'Administrators cannot suspend their own active administrative account.' });
    }

    const updated = db.updateUserStatus(userId, status as 'active' | 'suspended');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.addAdminLog({
      id: `log-${Date.now()}`,
      adminEmail: admin.email,
      action: 'UPDATE_USER_STATUS',
      target: updated.email,
      details: `Account status updated to ${status.toUpperCase()} by ${admin.email}`,
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `User account status updated to ${status}.`,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        accountStatus: updated.accountStatus
      }
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    return res.status(500).json({ success: false, message: 'Server error updating user account status.' });
  }
});

// GET /api/admin/logs & /api/admin/audit-logs
router.get(['/logs', '/audit-logs'], (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAdminLogs();
  return res.json({ success: true, logs });
});

export default router;
