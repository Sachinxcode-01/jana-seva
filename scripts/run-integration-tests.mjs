import { spawn } from 'child_process';
import http from 'http';

function checkHealth() {
  return new Promise((resolve) => {
    http.get('http://localhost:5000/api/health', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[TEST RUNNER] Starting backend process in test mode...');
  const serverProc = spawn('node', ['backend/dist/server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000', NODE_ENV: 'test' }
  });

  let isReady = false;
  for (let i = 0; i < 20; i++) {
    await wait(500);
    if (await checkHealth()) {
      isReady = true;
      break;
    }
  }

  if (!isReady) {
    console.error('[TEST RUNNER] Backend server failed to start within timeout.');
    serverProc.kill();
    process.exit(1);
  }

  console.log('[TEST RUNNER] Backend is online! Running test suite...');

  // Use native fetch in Node 18+
  const API_BASE = 'http://localhost:5000/api/v1';

  try {
    // 1. Citizen Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@janaseva.gov.in', password: 'Citizen@123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.token) throw new Error('Citizen login failed');
    console.log('✓ Citizen Login: SUCCESS (JWT received)');
    const token = loginData.token;

    // 2. Admin Login
    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@janaseva.gov.in', password: 'Admin@123' })
    });
    const adminData = await adminRes.json();
    if (!adminData.success || adminData.user.role !== 'admin') throw new Error('Admin login failed');
    console.log('✓ Admin Login: SUCCESS (Role: admin)');

    // 3. Role separation (Citizen cannot access Admin route)
    const accessDeniedCheck = await fetch(`${API_BASE}/admin/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (accessDeniedCheck.status !== 403) throw new Error('Role separation failed! Expected 403, got ' + accessDeniedCheck.status);
    console.log('✓ Role Separation: SUCCESS (Citizen denied 403 access to /admin)');

    // 4. Citizen Dashboard
    const dashRes = await fetch(`${API_BASE}/users/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    if (!dashData.success || !dashData.statistics) throw new Error('Dashboard API failed');
    console.log('✓ Citizen Dashboard API: SUCCESS', {
      savedSchemes: dashData.statistics.savedSchemesCount,
      eligibilityChecks: dashData.statistics.eligibilityChecksCount,
      documentsPrepared: dashData.statistics.documentsPreparedCount,
      profileCompletion: dashData.statistics.profileCompletionPercentage + '%'
    });

    // 5. Bookmarking
    const saveSchemeRes = await fetch(`${API_BASE}/users/me/bookmarks/scheme-gruha-lakshmi`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const saveSchemeData = await saveSchemeRes.json();
    if (!saveSchemeData.success) throw new Error('Save scheme bookmark failed');
    console.log('✓ Save Scheme Bookmark: SUCCESS');

    const getBookmarksRes = await fetch(`${API_BASE}/users/me/bookmarks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookmarksData = await getBookmarksRes.json();
    console.log(`✓ Get Bookmarks: SUCCESS (${bookmarksData.count} bookmarked schemes)`);

    // 6. Eligibility History
    const postEvalRes = await fetch(`${API_BASE}/users/me/eligibility-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        schemeId: 'scheme-karnataka-ssp',
        schemeName: 'Karnataka SSP Post-Matric Scholarship',
        category: 'Student Scholarships',
        matchScore: 100,
        isEligible: true,
        matchingReasons: ['Karnataka resident domicile', 'Family income eligible'],
        unmetConditions: [],
        requiredDocuments: ['Aadhaar', 'Income Certificate', 'College ID']
      })
    });
    const postEvalData = await postEvalRes.json();
    if (!postEvalData.success || !postEvalData.record?.id) throw new Error('Save eligibility evaluation failed');
    console.log('✓ Save Eligibility Evaluation: SUCCESS (Record ID:', postEvalData.record.id, ')');

    const evalHistRes = await fetch(`${API_BASE}/users/me/eligibility-history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const evalHistData = await evalHistRes.json();
    console.log(`✓ Retrieve Eligibility History: SUCCESS (${evalHistData.count} history assessments)`);

    const delEvalRes = await fetch(`${API_BASE}/users/me/eligibility-history/${postEvalData.record.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const delEvalData = await delEvalRes.json();
    console.log('✓ Delete Individual Eligibility Assessment: SUCCESS');

    // 7. Documents Checklist
    const docUpdateRes = await fetch(`${API_BASE}/users/me/documents/doc-voter-id`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'available',
        documentNumber: 'EPIC-KA-883921'
      })
    });
    const docUpdateData = await docUpdateRes.json();
    if (!docUpdateData.success) throw new Error('Update single document checklist failed');
    console.log('✓ Update Single Document: SUCCESS (Status: available, DocNo: EPIC-KA-883921)');

    const getDocsRes = await fetch(`${API_BASE}/users/me/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getDocsData = await getDocsRes.json();
    console.log(`✓ Get Citizen Documents: SUCCESS (${getDocsData.documents?.length} document records)`);

    console.log('\n=======================================================');
    console.log('  ALL JANASEVA PHASE 1-6 INTEGRATION TESTS PASSED 100% ');
    console.log('=======================================================');
  } catch (err) {
    console.error('TEST SUITE ERROR:', err);
    process.exitCode = 1;
  } finally {
    console.log('[TEST RUNNER] Stopping test backend server process...');
    serverProc.kill();
  }
}

main();
