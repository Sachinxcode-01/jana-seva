import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authenticate, AuthenticatedRequest } from '../auth/authMiddleware.js';
import { ApplicationRecord } from '../types.js';

const router = Router();

// Saved Schemes
router.get('/saved-schemes', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const schemes = db.getSavedSchemes(userId);
  return res.json({ success: true, count: schemes.length, schemes });
});

router.post('/saved-schemes/:schemeId/toggle', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const schemeId = String(req.params.schemeId);
  const result = db.toggleSaveScheme(userId, schemeId);
  return res.json({ success: true, saved: result.saved });
});

// Application Tracker
router.get('/applications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const applications = db.getUserApplications(userId);
  return res.json({ success: true, count: applications.length, applications });
});

const VALID_STATUSES = ['Draft', 'Submitted', 'In Review', 'Approved', 'Rejected'] as const;

router.post('/applications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { schemeId, applicationRefNo, appliedDate, status, notes } = req.body;

    if (!schemeId || !applicationRefNo || typeof applicationRefNo !== 'string') {
      return res.status(400).json({ success: false, message: 'Scheme ID and a valid Application Reference Number are required.' });
    }

    const cleanRefNo = applicationRefNo.trim();
    if (cleanRefNo.length < 2 || cleanRefNo.length > 100) {
      return res.status(400).json({ success: false, message: 'Application Reference Number must be between 2 and 100 characters.' });
    }

    const recordStatus = status && VALID_STATUSES.includes(status) ? status : 'Submitted';

    const scheme = db.getSchemeByIdOrSlug(String(schemeId).trim());
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    const cleanNotes = notes ? String(notes).trim().slice(0, 1000) : '';

    const newRecord: ApplicationRecord = {
      id: `app-${Date.now()}`,
      userId,
      schemeId: scheme.id,
      applicationRefNo: cleanRefNo,
      appliedDate: appliedDate || new Date().toISOString().split('T')[0],
      status: recordStatus,
      notes: cleanNotes,
      updatedAt: new Date().toISOString()
    };

    db.createApplicationRecord(newRecord);
    return res.status(201).json({ success: true, message: 'Application recorded successfully.', application: newRecord });
  } catch (err) {
    console.error('Error recording application:', err);
    return res.status(500).json({ success: false, message: 'Server error creating application record.' });
  }
});

router.put('/applications/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const { status, notes, applicationRefNo, appliedDate } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const updated = db.updateApplicationRecord(id, userId, {
    ...(status && { status }),
    ...(notes !== undefined && { notes: String(notes).trim().slice(0, 1000) }),
    ...(applicationRefNo && { applicationRefNo: String(applicationRefNo).trim().slice(0, 100) }),
    ...(appliedDate && { appliedDate: String(appliedDate).trim() })
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Application record not found or unauthorized.' });
  }

  return res.json({ success: true, message: 'Application updated successfully.', application: updated });
});

router.delete('/applications/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const deleted = db.deleteApplicationRecord(id, userId);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Application record not found.' });
  }

  return res.json({ success: true, message: 'Application record deleted.' });
});

// Notifications
router.get('/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const notifications = db.getNotifications(userId);
  return res.json({ success: true, count: notifications.length, notifications });
});

router.put('/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  db.markNotificationAsRead(id);
  return res.json({ success: true, message: 'Marked as read.' });
});

// Statutory Right to Erasure / Account Deletion (DPDP Act 2023 § 12 & GDPR Art 17)
router.delete('/account', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const deleted = db.deleteUserAccount(userId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }
  return res.json({ 
    success: true, 
    message: 'User account and all associated personal data permanently purged in compliance with DPDP Act 2023 Section 12.' 
  });
});

// Statutory Right to Data Portability (DPDP Act 2023 / GDPR Art 20)
router.get('/export-data', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const saved = db.getSavedSchemes(userId);
  const applications = db.getUserApplications(userId);
  const assessments = db.getUserAssessments(userId);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    complianceStandard: "India DPDP Act 2023 & GDPR Article 20",
    profile: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      state: user.state,
      occupation: user.occupation,
      incomeRange: user.incomeRange,
      createdAt: user.createdAt
    },
    savedSchemes: saved.map(s => ({ id: s.id, name: s.name, category: s.category })),
    applications,
    assessments
  };

  return res.json({ success: true, data: exportPayload });
});

export default router;
