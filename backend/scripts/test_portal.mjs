import { app, server } from '../dist/server.js';

const PORT = 5000;
const BASE = `http://localhost:${PORT}/api/v1`;

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- STARTING JANASEVA CITIZEN PORTAL API VERIFICATION ---');
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    assert(healthRes.ok, `Health endpoint responded with status ${healthRes.status}`);

    // 2. Demo Citizen Login
    const citizenLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrMobile: 'citizen@janaseva.gov.in',
        password: 'Citizen@123'
      })
    });
    assert(citizenLogin.ok && citizenLogin.data?.token, `Demo Citizen Login: token received (${citizenLogin.data?.user?.fullName})`);
    const citizenToken = citizenLogin.data?.token;
    const citizenAuthHeader = { Authorization: `Bearer ${citizenToken}` };

    // 3. Demo Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrMobile: 'admin@janaseva.gov.in',
        password: 'Admin@123'
      })
    });
    assert(adminLogin.ok && adminLogin.data?.user?.role === 'admin', 'Demo Admin Login successful with admin role');

    // 4. Forgot Password Flow
    const forgotRes = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'citizen@janaseva.gov.in' })
    });
    assert(forgotRes.ok && forgotRes.data?.devOtp, `Forgot password flow generated OTP (${forgotRes.data?.devOtp})`);

    // 5. Get Citizen Profile
    const profileRes = await request('/users/me', { headers: citizenAuthHeader });
    assert(profileRes.ok && profileRes.data?.user?.email === 'citizen@janaseva.gov.in', 'Fetched Citizen Profile successfully');

    // 6. Update Citizen Profile
    const updateProfileRes = await request('/users/me', {
      method: 'PUT',
      headers: citizenAuthHeader,
      body: JSON.stringify({
        district: 'Bengaluru Urban',
        occupation: 'Smallholder Farmer',
        villageTown: 'Ramanagara'
      })
    });
    assert(updateProfileRes.ok && updateProfileRes.data?.user?.district === 'Bengaluru Urban', 'Updated Citizen Profile location and occupation');

    // 7. Get Saved Schemes (Bookmarks)
    const bookmarksRes = await request('/users/me/bookmarks', { headers: citizenAuthHeader });
    assert(bookmarksRes.ok && Array.isArray(bookmarksRes.data?.schemes), `Fetched Bookmarks count: ${bookmarksRes.data?.schemes?.length}`);

    // 8. Add Bookmark
    const addBookmarkRes = await request('/users/me/bookmarks/scheme-ayushman-bharat', {
      method: 'POST',
      headers: citizenAuthHeader
    });
    assert(addBookmarkRes.ok, 'Added scheme bookmark (Ayushman Bharat)');

    // 9. Get Applications
    const appsRes = await request('/users/me/applications', { headers: citizenAuthHeader });
    assert(appsRes.ok && Array.isArray(appsRes.data?.applications), `Fetched Citizen Applications count: ${appsRes.data?.applications?.length}`);

    // 10. Add New Application
    const addAppRes = await request('/users/me/applications', {
      method: 'POST',
      headers: citizenAuthHeader,
      body: JSON.stringify({
        schemeId: 'scheme-pm-kisan',
        referenceNumber: 'KA-2026-TEST-999',
        submissionDate: '2026-11-20',
        status: 'SUBMITTED',
        notes: 'Submitted verification test'
      })
    });
    assert(addAppRes.ok && addAppRes.data?.application?.id, 'Created new citizen application record');
    const createdAppId = addAppRes.data?.application?.id;

    // 11. Update Application Status & Timeline
    if (createdAppId) {
      const updateAppRes = await request(`/users/me/applications/${createdAppId}`, {
        method: 'PUT',
        headers: citizenAuthHeader,
        body: JSON.stringify({
          status: 'IN_REVIEW',
          notes: 'Status updated to IN_REVIEW by citizen'
        })
      });
      assert(updateAppRes.ok && (updateAppRes.data?.application?.status === 'IN_REVIEW' || updateAppRes.data?.application?.status === 'In Review'), 'Updated citizen application status');

      // Clean up test app
      await request(`/users/me/applications/${createdAppId}`, {
        method: 'DELETE',
        headers: citizenAuthHeader
      });
    }

    // 12. Get Eligibility History
    const eligHistRes = await request('/users/me/eligibility-history', { headers: citizenAuthHeader });
    assert(eligHistRes.ok && Array.isArray(eligHistRes.data?.history), `Fetched Eligibility History count: ${eligHistRes.data?.history?.length}`);

    // 13. Save Eligibility Evaluation
    const saveEligRes = await request('/users/me/eligibility-history', {
      method: 'POST',
      headers: citizenAuthHeader,
      body: JSON.stringify({
        schemeId: 'scheme-pm-kisan',
        schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        isEligible: true,
        matchPercentage: 100,
        eligibleConditions: ['Citizen is landholding farmer', 'Annual income is within eligibility limits'],
        missingConditions: [],
        requiredDocuments: ['Aadhaar Card', 'Land Ownership Record (RTC/Pahani)', 'Bank Passbook']
      })
    });
    assert(saveEligRes.ok && saveEligRes.data?.record?.id, 'Saved eligibility evaluation record');

    // 14. Get Documents Checklist
    const docsRes = await request('/users/me/documents', { headers: citizenAuthHeader });
    assert(docsRes.ok && Array.isArray(docsRes.data?.documents), `Fetched Documents Checklist items: ${docsRes.data?.documents?.length}`);

    // 15. Update Document Status
    if (docsRes.data?.documents) {
      const updateDocsRes = await request('/users/me/documents', {
        method: 'PUT',
        headers: citizenAuthHeader,
        body: JSON.stringify({
          documents: docsRes.data.documents.map((d, i) => i === 0 ? { ...d, status: 'available' } : d)
        })
      });
      assert(updateDocsRes.ok, 'Updated Document Checklist status');
    }

    // 16. Get Notifications
    const notifsRes = await request('/users/me/notifications', { headers: citizenAuthHeader });
    assert(notifsRes.ok && Array.isArray(notifsRes.data?.notifications), `Fetched Notifications count: ${notifsRes.data?.notifications?.length}`);

    // 17. Mark all notifications as read
    const markAllRes = await request('/users/me/notifications/read-all', {
      method: 'PATCH',
      headers: citizenAuthHeader
    });
    assert(markAllRes.ok, 'Marked all notifications as read');

    // 18. Get Sessions
    const sessionsRes = await request('/users/me/sessions', { headers: citizenAuthHeader });
    assert(sessionsRes.ok && Array.isArray(sessionsRes.data?.sessions), `Fetched Active Sessions: ${sessionsRes.data?.sessions?.length}`);

    // 19. DPDP Act 2023 § 11 Data Portability Export
    const exportRes = await request('/users/me/export-data', { headers: citizenAuthHeader });
    assert(exportRes.ok && exportRes.data?.data?.complianceStandard?.includes('DPDP Act 2023'), 'Generated DPDP Act § 11 Data Portability export package');

    // 20. Security Authorization Check: Unauthenticated request to /users/me must be 401
    const unauthRes = await request('/users/me');
    assert(unauthRes.status === 401, `Unauthenticated request correctly rejected with 401 (got ${unauthRes.status})`);

    // 21. Security Role Check: Citizen accessing /admin/overview must be 403
    const adminForbiddenRes = await fetch(`http://localhost:${PORT}/api/admin/overview`, {
      headers: citizenAuthHeader
    });
    assert(adminForbiddenRes.status === 403, `Citizen accessing admin route correctly rejected with 403 (got ${adminForbiddenRes.status})`);

  } catch (err) {
    console.error('Test execution error:', err);
    failures++;
  } finally {
    console.log('-------------------------------------------------------');
    if (failures === 0) {
      console.log('🎉 ALL 21 TEST ASSERTIONS PASSED WITH ZERO FAILURES!');
    } else {
      console.error(`💥 ENCOUNTERED ${failures} TEST FAILURES!`);
    }
    console.log('-------------------------------------------------------');
    server.close(() => {
      process.exit(failures === 0 ? 0 : 1);
    });
  }
}

// Give server 500ms to initialize before running tests
setTimeout(runTests, 500);
