const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('=== JANASEVA FULL-STACK INTEGRATION TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. WORKFLOW A: Citizen Registration, Login, Dashboard & Profile Update
    console.log('--- Workflow A: Citizen Registration, Login & Profile ---');
    const randomSuffix = Date.now().toString().slice(-6);
    const citizenEmail = `citizen_${randomSuffix}@test.gov.in`;
    const citizenMobile = `98${randomSuffix}12`;

    const regRes = await request('POST', '/auth/register', {
      email: citizenEmail,
      mobileNumber: citizenMobile,
      password: 'Password123!',
      fullName: `Test Citizen ${randomSuffix}`,
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      occupation: 'Small Farmer',
      incomeRange: 'Below 2.5 Lakhs'
    });
    assert(regRes.status === 201 && regRes.data.token, `Citizen Registered: ${citizenEmail}`);
    const citizenToken = regRes.data.token;
    const citizenId = regRes.data.user.id;

    // Login with registered user
    const loginRes = await request('POST', '/auth/login', {
      identifier: citizenEmail,
      password: 'Password123!'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Citizen Login with Email verified');

    // Fetch Citizen Dashboard
    const dashRes = await request('GET', '/users/me/dashboard', null, citizenToken);
    assert(dashRes.status === 200 && dashRes.data.success, 'Citizen Dashboard retrieved');

    // Update Profile
    const profileUpdateRes = await request('PUT', '/users/me', {
      fullName: `Updated Citizen ${randomSuffix}`,
      occupation: 'Progressive Farmer',
      district: 'Mysuru'
    }, citizenToken);
    assert(profileUpdateRes.status === 200 && profileUpdateRes.data.user.district === 'Mysuru', 'Citizen Profile Update persisted');

    // 2. WORKFLOW B: Scheme Directory, Save Scheme, View Bookmarks, Remove Bookmark
    console.log('\n--- Workflow B: Scheme Directory & Bookmarks ---');
    const schemesRes = await request('GET', '/schemes');
    assert(schemesRes.status === 200 && Array.isArray(schemesRes.data.schemes) && schemesRes.data.schemes.length > 0, `Schemes listed: ${schemesRes.data.schemes.length} schemes`);
    const targetScheme = schemesRes.data.schemes[0];

    // Save Scheme
    const saveRes = await request('POST', `/users/me/bookmarks/${targetScheme.id}`, null, citizenToken);
    assert(saveRes.status === 200 && saveRes.data.success, `Scheme ${targetScheme.id} saved to bookmarks`);

    // Verify in Bookmarks
    const bookmarksRes = await request('GET', '/users/me/bookmarks', null, citizenToken);
    const isBookmarked = bookmarksRes.data.schemes && bookmarksRes.data.schemes.some(s => s.id === targetScheme.id);
    assert(bookmarksRes.status === 200 && isBookmarked, 'Saved scheme verified in citizen bookmarks');

    // Remove Scheme
    const removeRes = await request('DELETE', `/users/me/bookmarks/${targetScheme.id}`, null, citizenToken);
    assert(removeRes.status === 200 && removeRes.data.success, 'Scheme removed from bookmarks');

    // 3. WORKFLOW C: Eligibility Evaluation & History Persistence
    console.log('\n--- Workflow C: Eligibility Check & History ---');
    const evalRes = await request('POST', '/eligibility/check', {
      age: 32,
      gender: 'Male',
      beneficiaryCategory: 'General',
      state: 'Karnataka',
      annualIncome: 180000,
      occupation: 'Farmer',
      employmentStatus: 'Self-Employed'
    });
    assert(evalRes.status === 200 && evalRes.data.success && (evalRes.data.eligibleSchemes || evalRes.data.totalEvaluated), `Eligibility evaluation succeeded (total: ${evalRes.data.totalEvaluated})`);

    // Save evaluation to history
    const saveEvalRes = await request('POST', '/users/me/eligibility-history', {
      schemeId: targetScheme.id,
      schemeName: targetScheme.name,
      isEligible: true,
      matchScore: 95,
      inputCriteria: { age: 32, occupation: 'Farmer', state: 'Karnataka', beneficiaryCategory: 'General' },
      matchingReasons: ['Eligible occupation', 'Karnataka resident']
    }, citizenToken);
    assert([200, 201].includes(saveEvalRes.status) && saveEvalRes.data.success, 'Eligibility evaluation saved to history');

    // Retrieve history
    const historyRes = await request('GET', '/users/me/eligibility-history', null, citizenToken);
    assert(historyRes.status === 200 && historyRes.data.history?.length > 0, 'Eligibility history retrieved');

    // 4. WORKFLOW D: Documents Checklist Persistence
    console.log('\n--- Workflow D: Documents Management ---');
    const docsRes = await request('GET', '/users/me/documents', null, citizenToken);
    assert(docsRes.status === 200 && Array.isArray(docsRes.data.documents) && docsRes.data.documents.length > 0, `Citizen documents checklist loaded (${docsRes.data.documents.length} items)`);
    const targetDoc = docsRes.data.documents[0];

    // Update document status
    const updateDocRes = await request('PUT', `/users/me/documents/${targetDoc.id}`, {
      status: 'available',
      documentNumber: 'DOC-12345-TEST',
      notes: 'Verified copy available'
    }, citizenToken);
    assert(updateDocRes.status === 200 && updateDocRes.data.success, `Document ${targetDoc.id} status updated to available`);

    // Verify persistence
    const reDocsRes = await request('GET', '/users/me/documents', null, citizenToken);
    const persistedDoc = reDocsRes.data.documents.find(d => d.id === targetDoc.id);
    assert(persistedDoc && persistedDoc.status === 'available' && persistedDoc.documentNumber === 'DOC-12345-TEST', 'Document update persisted in user checklist');

    // 5. WORKFLOW E & F: Admin Login, Create Scheme, Publish Toggle, Update Scheme
    console.log('\n--- Workflow E & F: Admin Operations & Scheme Lifecycle ---');
    const adminLoginRes = await request('POST', '/auth/login', {
      identifier: 'admin@janaseva.gov.in',
      password: 'Admin@123'
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.token && ['admin', 'ADMIN'].includes(adminLoginRes.data.user.role?.toLowerCase()), 'Admin authentication verified');
    const adminToken = adminLoginRes.data.token;

    // Create New Scheme
    const newSchemeName = `Karnataka Solar Pump Scheme ${randomSuffix}`;
    const createSchemeRes = await request('POST', '/admin/schemes', {
      name: newSchemeName,
      department: 'Energy & Agriculture',
      category: 'Farmer Welfare',
      level: 'State',
      state: 'Karnataka',
      description: 'Subsidized solar water pumps for small farmers in Karnataka.',
      briefDescription: 'Subsidized solar water pumps for small farmers',
      detailedDescription: 'Comprehensive financial subsidy for farmers adopting solar-powered pumps.',
      benefits: ['90% capital subsidy', 'Free solar panels installation'],
      requiredDocuments: ['Aadhaar Card', 'Land Record / RTC'],
      applicationUrl: 'https://karnataka.gov.in/solar-pump',
      isPublished: false,
      isVerified: true
    }, adminToken);
    assert(createSchemeRes.status === 201 && createSchemeRes.data.scheme && createSchemeRes.data.scheme.id, `Admin created scheme: ${newSchemeName}`);
    const createdSchemeId = createSchemeRes.data.scheme.id;

    // Verify it is NOT yet in public listing (since isPublished is false)
    const publicSchemesBefore = await request('GET', '/schemes');
    const foundBeforePublish = publicSchemesBefore.data.schemes.some(s => s.id === createdSchemeId);
    assert(!foundBeforePublish, 'Draft scheme is not visible in public directory');

    // Publish the scheme
    const publishRes = await request('PATCH', `/admin/schemes/${createdSchemeId}/publish`, { isPublished: true }, adminToken);
    assert(publishRes.status === 200 && publishRes.data.scheme.isPublished === true, 'Admin published scheme');

    // Verify it IS now visible in public directory
    const publicSchemesAfter = await request('GET', '/schemes');
    const foundAfterPublish = publicSchemesAfter.data.schemes.some(s => s.id === createdSchemeId);
    assert(foundAfterPublish, 'Published scheme is immediately visible in public directory');

    // Update the scheme
    const updateSchemeRes = await request('PUT', `/admin/schemes/${createdSchemeId}`, {
      name: `${newSchemeName} - Revised 2026`,
      benefits: ['95% capital subsidy', 'Free maintenance for 5 years']
    }, adminToken);
    assert(updateSchemeRes.status === 200 && updateSchemeRes.data.scheme.name.includes('Revised 2026'), 'Admin updated scheme details');

    // 6. WORKFLOW G: RBAC Protection - Citizen cannot access Admin API
    console.log('\n--- Workflow G: RBAC Protection ---');
    const rbacRes = await request('GET', '/admin/schemes', null, citizenToken);
    assert(rbacRes.status === 403, `Citizen token blocked from Admin API (Status: ${rbacRes.status})`);

    const rbacCreateRes = await request('POST', '/admin/schemes', { name: 'Illegal Scheme' }, citizenToken);
    assert(rbacCreateRes.status === 403, `Citizen token blocked from POST /admin/schemes (Status: ${rbacCreateRes.status})`);

    // 7. WORKFLOW H: Tenant Isolation - Citizen B cannot access Citizen A records
    console.log('\n--- Workflow H: Tenant Data Isolation ---');
    const citizenBRes = await request('POST', '/auth/register', {
      email: `citizenB_${randomSuffix}@test.gov.in`,
      mobileNumber: `97${randomSuffix}34`,
      password: 'Password123!',
      fullName: `Citizen B ${randomSuffix}`,
      state: 'Karnataka'
    });
    const citizenBToken = citizenBRes.data.token;

    // Check Citizen B's bookmarks - should be empty / not include Citizen A's
    const bBookmarks = await request('GET', '/users/me/bookmarks', null, citizenBToken);
    assert(bBookmarks.status === 200 && bBookmarks.data.schemes.length === 0, "Citizen B's bookmarks isolated from Citizen A");

    // Check Citizen B's eligibility history - should not include Citizen A's
    const bHistory = await request('GET', '/users/me/eligibility-history', null, citizenBToken);
    assert(bHistory.status === 200 && bHistory.data.history.length === 0, "Citizen B's eligibility history isolated from Citizen A");

    // 8. WORKFLOW I: Session Invalidation
    console.log('\n--- Workflow I: Session Management & Invalidation ---');
    const sessionsRes = await request('GET', '/users/me/sessions', null, citizenBToken);
    assert(sessionsRes.status === 200 && sessionsRes.data.sessions?.length > 0, 'Active sessions retrieved for Citizen B');
    const activeSession = sessionsRes.data.sessions[0];

    // Revoke session
    const revokeRes = await request('DELETE', `/users/me/sessions/${activeSession.id}`, null, citizenBToken);
    assert(revokeRes.status === 200 && revokeRes.data.success, `Session ${activeSession.id} terminated`);

    // Next request with same citizenBToken must fail with 401 Unauthorized
    const recheckRes = await request('GET', '/users/me/dashboard', null, citizenBToken);
    assert(recheckRes.status === 401, `Revoked session rejected on subsequent API call (Status: ${recheckRes.status})`);

    console.log('\n==================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('==================================================');
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

run();
