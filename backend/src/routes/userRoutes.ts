import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';
import { authenticate, AuthenticatedRequest } from '../auth/authMiddleware.js';
import { ApplicationRecord, SavedEligibilityRecord, DocumentItem } from '../types.js';

const router = Router();

  // ==========================================
  // 1. PROFILE MANAGEMENT (/users/me)
  // ==========================================

  // Helper to return clean, safe user representation
  function formatSafeUser(user: any) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber || '',
      role: user.role,
      state: user.state || 'Karnataka',
      district: user.district || '',
      villageTown: user.villageTown || '',
      occupation: user.occupation || '',
      beneficiaryCategory: user.beneficiaryCategory || 'General',
      incomeRange: user.incomeRange || '',
      gender: user.gender || 'Other',
      preferredLanguage: user.preferredLanguage || 'en',
      preferences: user.preferences || {
        language: 'en',
        emailNotifications: true,
        smsNotifications: false,
        schemeUpdates: true,
        theme: 'dark'
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // GET /api/v1/users/me & /api/user/me
  router.get(['/me', '/profile'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    const user = db.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: formatSafeUser(user) });
  });

  // GET /api/v1/users/me/dashboard & /api/user/dashboard
  router.get(['/me/dashboard', '/dashboard'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = db.getUserById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      const saved = db.getSavedSchemes(userId);
      const eligibilityHistory = db.getUserEligibilityHistory(userId);
      const documents = db.getUserDocuments(userId);
      const notifications = db.getNotifications(userId);
      const allSchemes = db.getSchemes();

      // Profile Completion Percentage Calculation
      let score = 0;
      if (user.fullName) score += 20;
      if (user.email) score += 15;
      if (user.mobileNumber) score += 15;
      if (user.state) score += 15;
      if (user.district) score += 10;
      if (user.occupation) score += 15;
      if (user.incomeRange) score += 10;
      const profileCompletion = Math.min(100, score);

      const availableDocsCount = documents.filter(d => d.status === 'available').length;
      const pendingDocsCount = documents.filter(d => d.status === 'pending').length;

      // Filter recommended schemes tailored to user profile
      const recommended = allSchemes.filter(s => {
        if (user.occupation?.toLowerCase().includes('farmer') && (s.category === 'Farmer Welfare' || s.beneficiaryCategory === 'Farmers')) return true;
        if (user.occupation?.toLowerCase().includes('student') && (s.category === 'Student Scholarships' || s.beneficiaryCategory === 'Students')) return true;
        if (user.gender === 'Female' && (s.category === 'Women Empowerment' || s.beneficiaryCategory === 'Women')) return true;
        if (s.beneficiaryCategory === 'General' || s.category === 'Health and Social Welfare' || s.category === 'Financial Assistance') return true;
        return false;
      }).slice(0, 4);

      return res.json({
        success: true,
        user: formatSafeUser(user),
        statistics: {
          savedSchemesCount: saved.length,
          eligibilityChecksCount: eligibilityHistory.length,
          documentsPreparedCount: availableDocsCount,
          totalDocumentsCount: documents.length,
          profileCompletionPercentage: profileCompletion
        },
        recentlySavedSchemes: saved.slice(0, 4),
        recentlyEvaluatedSchemes: eligibilityHistory.slice(0, 4),
        recommendedSchemes: recommended,
        documentsSummary: {
          available: availableDocsCount,
          pending: pendingDocsCount,
          total: documents.length
        },
        announcements: notifications.slice(0, 3)
      });
    } catch (err) {
      console.error('Dashboard endpoint error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving citizen dashboard data.' });
    }
  });

  // PUT /api/v1/users/me & /api/user/me
  router.put(['/me', '/profile'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const {
        fullName,
        mobileNumber,
        state,
        district,
        villageTown,
        occupation,
        beneficiaryCategory,
        incomeRange,
        gender,
        preferredLanguage,
        preferences
      } = req.body;

      if (fullName !== undefined && (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2)) {
        return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
      }

      if (mobileNumber !== undefined && mobileNumber !== null && String(mobileNumber).trim() !== '') {
        const existingMobile = db.getUserByEmailOrMobile(String(mobileNumber).trim());
        if (existingMobile && existingMobile.id !== userId) {
          return res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
        }
      }

      const updated = db.updateUserProfile(userId, {
        fullName,
        mobileNumber,
        state,
        district,
        villageTown,
        occupation,
        beneficiaryCategory,
        incomeRange,
        gender,
        preferredLanguage,
        preferences
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      return res.json({
        success: true,
        message: 'Citizen profile updated successfully.',
        user: formatSafeUser(updated)
      });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  });

  // PUT /api/v1/users/me/password & /api/user/password
  router.put(['/me/password', '/password'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(newPassword, salt);
      db.updateUserPassword(userId, passwordHash);

      return res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      console.error('Password change error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating password.' });
    }
  });

  // ==========================================
  // 2. SAVED SCHEMES / BOOKMARKS
  // ==========================================

  // GET /api/v1/users/me/bookmarks & /api/user/saved-schemes
  router.get(['/me/bookmarks', '/saved-schemes'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const schemes = db.getSavedSchemes(userId);
    return res.json({ success: true, count: schemes.length, schemes, bookmarks: schemes });
  });

  // POST /api/v1/users/me/bookmarks/:schemeId
  router.post(['/me/bookmarks/:schemeId', '/saved-schemes/:schemeId'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const schemeId = String(req.params.schemeId);
    const result = db.addSavedScheme(userId, schemeId);
    return res.json({ success: true, message: 'Scheme bookmarked successfully.', saved: true });
  });

  // DELETE /api/v1/users/me/bookmarks/:schemeId
  router.delete(['/me/bookmarks/:schemeId', '/saved-schemes/:schemeId'], authenticate, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const schemeId = String(req.params.schemeId);
    const result = db.removeSavedScheme(userId, schemeId);
    return res.json({ success: true, message: 'Scheme removed from saved bookmarks.', saved: false });
  });

  // Toggle compatibility route: POST /api/user/saved-schemes/:schemeId/toggle
  router.post('/saved-schemes/:schemeId/toggle', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const schemeId = String(req.params.schemeId);
    const result = db.toggleSaveScheme(userId, schemeId);
    return res.json({ success: true, saved: result.saved });
  });

    // ==========================================
    // 3. CITIZEN APPLICATION TRACKER
    // ==========================================

    const VALID_STATUSES = ['Draft', 'Submitted', 'In Review', 'Approved', 'Rejected'] as const;

    // GET /api/v1/users/me/applications & /api/user/applications
    router.get(['/me/applications', '/applications'], authenticate, (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      const applications = db.getUserApplications(userId);
      return res.json({ success: true, count: applications.length, applications });
    });

      // POST /api/v1/users/me/applications & /api/user/applications
      router.post(['/me/applications', '/applications'], authenticate, (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.user!.id;
          const { schemeId, notes } = req.body;
          const applicationRefNo = req.body.applicationRefNo || req.body.referenceNumber;
          const appliedDate = req.body.appliedDate || req.body.submissionDate;

          if (!schemeId || !applicationRefNo || typeof applicationRefNo !== 'string') {
            return res.status(400).json({ success: false, message: 'Scheme ID and a valid Application Reference Number are required.' });
          }

          const cleanRefNo = applicationRefNo.trim();
          if (cleanRefNo.length < 2 || cleanRefNo.length > 100) {
            return res.status(400).json({ success: false, message: 'Application Reference Number must be between 2 and 100 characters.' });
          }

          const statusMap: Record<string, typeof VALID_STATUSES[number]> = {
            'draft': 'Draft',
            'submitted': 'Submitted',
            'in_review': 'In Review',
            'in review': 'In Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
          };
          const rawStatus = req.body.status ? String(req.body.status).toLowerCase().replace('-', '_') : '';
          const recordStatus = statusMap[rawStatus] || (VALID_STATUSES.includes(req.body.status) ? req.body.status : 'Submitted');

          const scheme = db.getSchemeByIdOrSlug(String(schemeId).trim());
          if (!scheme) {
            return res.status(404).json({ success: false, message: 'Scheme not found.' });
          }

          const cleanNotes = notes ? String(notes).trim().slice(0, 1000) : '';
          const dateStr = appliedDate || new Date().toISOString().split('T')[0];

          const newRecord: ApplicationRecord = {
            id: `app-${Date.now()}`,
            userId,
            schemeId: scheme.id,
            applicationRefNo: cleanRefNo,
            appliedDate: dateStr,
            status: recordStatus,
            notes: cleanNotes,
            timeline: [
              {
                status: recordStatus,
                date: dateStr,
                note: cleanNotes || 'Application record created by citizen.'
              }
            ],
            updatedAt: new Date().toISOString()
          };

          db.createApplicationRecord(newRecord);
          return res.status(201).json({
            success: true,
            message: 'Application recorded successfully.',
            application: { ...newRecord, scheme }
          });
        } catch (err) {
          console.error('Error recording application:', err);
          return res.status(500).json({ success: false, message: 'Server error creating application record.' });
        }
      });

        // PUT /api/v1/users/me/applications/:id & /api/user/applications/:id
        router.put(['/me/applications/:id', '/applications/:id'], authenticate, (req: AuthenticatedRequest, res: Response) => {
          const userId = req.user!.id;
          const id = String(req.params.id);
          const { notes, applicationRefNo, appliedDate } = req.body;

            const statusMap: Record<string, typeof VALID_STATUSES[number]> = {
              'draft': 'Draft',
              'submitted': 'Submitted',
              'in_review': 'In Review',
              'in review': 'In Review',
              'approved': 'Approved',
              'rejected': 'Rejected'
            };
            let normalizedStatus: typeof VALID_STATUSES[number] | undefined;
            if (req.body.status) {
              const raw = String(req.body.status).toLowerCase().replace('-', '_');
              normalizedStatus = statusMap[raw] || (VALID_STATUSES.includes(req.body.status) ? req.body.status : undefined);
              if (!normalizedStatus) {
                return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
              }
            }

            const updated = db.updateApplicationRecord(id, userId, {
              ...(normalizedStatus && { status: normalizedStatus }),
              ...(notes !== undefined && { notes: String(notes).trim().slice(0, 1000) }),
              ...(applicationRefNo && { applicationRefNo: String(applicationRefNo).trim().slice(0, 100) }),
              ...(appliedDate && { appliedDate: String(appliedDate).trim() })
            });

            if (!updated) {
              return res.status(404).json({ success: false, message: 'Application record not found or unauthorized.' });
            }

            return res.json({
              success: true,
              message: 'Application updated successfully.',
              application: updated
            });
          });

          // DELETE /api/v1/users/me/applications/:id & /api/user/applications/:id
          router.delete(['/me/applications/:id', '/applications/:id'], authenticate, (req: AuthenticatedRequest, res: Response) => {
            const userId = req.user!.id;
            const id = String(req.params.id);
            const deleted = db.deleteApplicationRecord(id, userId);

            if (!deleted) {
              return res.status(404).json({ success: false, message: 'Application record not found or unauthorized.' });
            }

            return res.json({ success: true, message: 'Application record deleted successfully.' });
          });

            // ==========================================
            // 4. ELIGIBILITY HISTORY
            // ==========================================

            // GET /api/v1/users/me/eligibility-history
            router.get(['/me/eligibility-history', '/eligibility-history'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              const userId = req.user!.id;
              const history = db.getUserEligibilityHistory(userId);
              return res.json({ success: true, count: history.length, history });
            });

            // POST /api/v1/users/me/eligibility-history
            router.post(['/me/eligibility-history', '/eligibility-history'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              try {
                const userId = req.user!.id;
                const {
                  schemeId,
                  schemeName,
                  category,
                  matchScore,
                  isEligible,
                  matchingReasons,
                  unmetConditions,
                  requiredDocuments,
                  inputCriteria
                } = req.body;

                if (!schemeId || !schemeName) {
                  return res.status(400).json({ success: false, message: 'Scheme ID and Name are required.' });
                }

                const newRecord: SavedEligibilityRecord = {
                  id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  userId,
                  schemeId: String(schemeId),
                  schemeName: String(schemeName),
                  category: category || 'Financial Assistance',
                  matchScore: Number(matchScore) || 0,
                  isEligible: Boolean(isEligible),
                  matchingReasons: Array.isArray(matchingReasons) ? matchingReasons : [],
                  unmetConditions: Array.isArray(unmetConditions) ? unmetConditions : [],
                  requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : [],
                  evaluatedAt: new Date().toISOString(),
                  inputCriteria: inputCriteria || {
                    age: 0,
                    state: 'Karnataka',
                    occupation: 'General',
                    beneficiaryCategory: 'General',
                    annualIncome: 0
                  }
                };

                db.saveEligibilityRecord(newRecord);
                return res.status(201).json({ success: true, message: 'Eligibility evaluation saved to history.', record: newRecord });
              } catch (err) {
                console.error('Error saving eligibility history:', err);
                return res.status(500).json({ success: false, message: 'Server error saving eligibility evaluation.' });
              }
            });

            // DELETE /api/v1/users/me/eligibility-history/:id
            router.delete(['/me/eligibility-history/:id', '/eligibility-history/:id'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              const userId = req.user!.id;
              const id = String(req.params.id);
              const deleted = db.deleteEligibilityHistoryRecord(id, userId);

              if (!deleted) {
                return res.status(404).json({ success: false, message: 'Evaluation record not found or unauthorized.' });
              }

              return res.json({ success: true, message: 'Eligibility assessment removed from history.' });
            });

            // ==========================================
            // 5. CITIZEN DOCUMENTS CHECKLIST
            // ==========================================

            // GET /api/v1/users/me/documents & /api/user/documents
            router.get(['/me/documents', '/documents'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              const userId = req.user!.id;
              const documents = db.getUserDocuments(userId);
              return res.json({ success: true, documents });
            });

            // PUT /api/v1/users/me/documents & /api/user/documents
            router.put(['/me/documents', '/documents'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              try {
                const userId = req.user!.id;
                const { documents } = req.body;

                if (!Array.isArray(documents)) {
                  return res.status(400).json({ success: false, message: 'Documents checklist must be an array.' });
                }

                const updated = db.updateUserDocuments(userId, documents);
                return res.json({ success: true, message: 'Documents checklist updated.', documents: updated });
              } catch (err) {
                console.error('Update documents error:', err);
                return res.status(500).json({ success: false, message: 'Failed to update documents checklist.' });
              }
            });

            // PUT /api/v1/users/me/documents/:documentId & /api/user/documents/:documentId
            router.put(['/me/documents/:documentId', '/documents/:documentId'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              try {
                const userId = req.user!.id;
                const documentId = String(req.params.documentId);
                const { status, documentNumber, notes } = req.body;

                const validStatuses = ['available', 'pending', 'not_applicable'];
                if (status && !validStatuses.includes(status)) {
                  return res.status(400).json({ success: false, message: 'Invalid status. Must be available, pending, or not_applicable.' });
                }

                const updated = db.updateUserSingleDocument(userId, documentId, {
                  ...(status && { status }),
                  ...(documentNumber !== undefined && { documentNumber: String(documentNumber).trim().slice(0, 100) }),
                  ...(notes !== undefined && { notes: String(notes).trim().slice(0, 500) })
                });

                if (!updated) {
                  return res.status(404).json({ success: false, message: 'Document checklist item not found.' });
                }

                return res.json({ success: true, message: 'Document checklist item updated.', document: updated });
              } catch (err) {
                console.error('Update single document error:', err);
                return res.status(500).json({ success: false, message: 'Server error updating document item.' });
              }
            });

            // ==========================================
            // 6. NOTIFICATION CENTER
            // ==========================================

            // GET /api/v1/users/me/notifications & /api/user/notifications
            router.get(['/me/notifications', '/notifications'], authenticate, (req: AuthenticatedRequest, res: Response) => {
              const userId = req.user!.id;
              const notifications = db.getNotifications(userId);
              return res.json({ success: true, count: notifications.length, notifications });
            });

              // PATCH /api/v1/users/me/notifications/:id/read & PUT /api/user/notifications/:id/read
              router.patch(['/me/notifications/:id/read', '/notifications/:id/read'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const id = String(req.params.id);
                const userId = req.user!.id;
                const updated = db.markNotificationAsRead(id, userId);
                if (!updated) {
                  return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
                }
                return res.json({ success: true, message: 'Notification marked as read.' });
              });

              router.put(['/notifications/:id/read'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const id = String(req.params.id);
                const userId = req.user!.id;
                const updated = db.markNotificationAsRead(id, userId);
                if (!updated) {
                  return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
                }
                return res.json({ success: true, message: 'Notification marked as read.' });
              });

              // PATCH /api/v1/users/me/notifications/read-all & PUT /api/user/notifications/read-all
              router.patch(['/me/notifications/read-all', '/notifications/read-all'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const userId = req.user!.id;
                db.markAllNotificationsAsRead(userId);
                return res.json({ success: true, message: 'All notifications marked as read.' });
              });

              router.put(['/notifications/read-all'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const userId = req.user!.id;
                db.markAllNotificationsAsRead(userId);
                return res.json({ success: true, message: 'All notifications marked as read.' });
              });

              // DELETE /api/v1/users/me/notifications/:id & /api/user/notifications/:id
              router.delete(['/me/notifications/:id', '/notifications/:id'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const userId = req.user!.id;
                const id = String(req.params.id);
                const deleted = db.deleteNotification(id, userId);
                return res.json({ success: true, message: 'Notification dismissed.' });
              });

              // ==========================================
              // 7. USER SESSIONS & SECURITY
              // ==========================================

              // GET /api/v1/users/me/sessions
              router.get(['/me/sessions', '/sessions'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const userId = req.user!.id;
                const sessions = db.getUserSessions(userId);
                return res.json({ success: true, count: sessions.length, sessions });
              });

              // DELETE /api/v1/users/me/sessions/:sessionId
              router.delete(['/me/sessions/:sessionId', '/sessions/:sessionId'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                const userId = req.user!.id;
                const sessionId = String(req.params.sessionId);
                db.removeSession(userId, sessionId);
                return res.json({ success: true, message: 'Session terminated.' });
              });

              // ==========================================
              // 8. PRIVACY & STATUTORY COMPLIANCE (DPDP ACT 2023)
              // ==========================================

              // Statutory Right to Erasure / Account Deletion (DPDP Act 2023 § 12 & GDPR Art 17)
                router.delete(['/account', '/me'], authenticate, (req: AuthenticatedRequest, res: Response) => {
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
                  router.get(['/export-data', '/me/export-data', '/me/export'], authenticate, (req: AuthenticatedRequest, res: Response) => {
                    const userId = req.user!.id;
                    const user = db.getUserById(userId);
                    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

                    const saved = db.getSavedSchemes(userId);
                    const applications = db.getUserApplications(userId);
                    const assessments = db.getUserAssessments(userId);
                    const eligibilityHistory = db.getUserEligibilityHistory(userId);
                    const documents = db.getUserDocuments(userId);

                    const exportPayload = {
                      exportedAt: new Date().toISOString(),
                      complianceStandard: "India DPDP Act 2023 & GDPR Article 20",
                      profile: formatSafeUser(user),
                      savedSchemes: saved.map(s => ({ id: s.id, name: s.name, category: s.category })),
                      applications,
    assessments,
                      eligibilityHistory,
                      documents
                    };

                    return res.json({ success: true, data: exportPayload });
                  });

                  export default router;
