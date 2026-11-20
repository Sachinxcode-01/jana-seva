# JANASEVA – Production-Level Quality Audit & Architectural Review

**Audit Date:** November 20, 2026  
**Auditor Roles:** Senior Full-Stack Engineer, Software Architect, UI/UX Designer, QA Engineer, Application Security Specialist  
**Application Target:** JANASEVA – Government Scheme Awareness & Livelihood Assistance Portal  
**Target Environments:** Development (Node/Vite, Local JSON DB) & Production (Node/Express, PostgreSQL, Cloud/Vercel/Container)

---

## 1. Executive Summary

JANASEVA is an ambitious civic-technology platform built to bridge the awareness gap between eligible citizens and Indian welfare schemes (with a primary focus on Karnataka State and Central Sector initiatives). The application comprises:
- **Backend:** Node.js, Express, TypeScript, Helmet, Compression, JWT authentication, bcrypt, Express Rate Limiter, and a JSON-based database abstraction with relational mapping to PostgreSQL (`backend/database/schema.sql`).
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Lucide icons, Recharts, GSAP, Axios, React Router v7.

While the fundamental architecture and features (authentication, role-based access, public scheme browsing, eligibility checker, and citizen portal) are established, this comprehensive audit reveals several architectural discrepancies, UI/UX rough edges, data-synchronization gaps, and opportunities for performance and security hardening required to reach enterprise government-tech production quality.

---

## 2. Inventory of Current Features & Implementation Status

| Feature / Domain | Implementation Status | Verdict | Notes |
| :--- | :--- | :--- | :--- |
| **Authentication (Login/Register/Logout)** | Implemented | Needs Hardening | JWT session management exists; needs strict form validation, production password rules, and consistent token refresh/revocation. |
| **Forgot & Reset Password Workflow** | Partially Implemented | Needs Polishing | Dev OTP simulated; needs proper rate-limiting, expired OTP handling, and consistent UX feedback. |
| **Role-Based Access Control (RBAC)** | Implemented | Functional | Backend enforces `requireAdmin` on `/api/admin/*`; citizen token blocked from admin endpoints (verified 403). |
| **Public Landing Page (Hero, Features, Stats)** | Implemented | Needs UI Polish | High-impact visuals; requires smoother mobile touch navigation and layout consistency. |
| **Scheme Directory & Filtering** | Implemented | Functional | Central/State classification, category filtering, search, and sorting. Lacks pagination on large scheme catalogs. |
| **Scheme Details Modal & View** | Implemented | Functional | Department, eligibility rules, benefits, documents, and official portal links; print support. Needs direct deep-linkable URLs. |
| **Deterministic Eligibility Engine** | Implemented | Partially Complete | Calculates weighted match score and checks basic constraints; needs edge-case handling (income thresholds, multi-state domicile, boundary conditions) and unit tests. |
| **Citizen Dashboard** | Implemented | Needs Data Polish | Shows stats, bookmarks count, eligibility history count, document status, and recommended schemes. |
| **Citizen Profile Management** | Implemented | Functional | Updates user details (occupation, income range, domicile district, preferred language). Profile completion calculation works. |
| **Saved Schemes (Bookmarks)** | Implemented with Flaw | Needs Fix | Discrepancy between `/api/v1/users/me/bookmarks` and `/user/saved-schemes/:id/toggle` mounting causing occasional fallback to local storage. |
| **Eligibility History Persistence** | Implemented | Functional | Saves evaluation records and retrieves them with category filtering and deletion. |
| **My Documents Checklist** | Implemented | Functional | Tracks available, pending, and not-applicable documents with certificate numbers and personal notes. |
| **Admin Dashboard & Analytics** | Implemented | Functional | Metrics for user count, scheme categories, views, and recent activity logs. Charts powered by Recharts. |
| **Admin Scheme CRUD** | Implemented | Needs Validation | Create, edit, publish/unpublish, delete. Needs explicit archival workflow (`isArchived`), strict schema validation, and audit tracking. |
| **Admin User Management** | Partially Implemented | Incomplete | Admin can view users table, but lacks search/filter, user account status management (active/suspended), and detailed audit logs on user edits. |
| **Administrative Audit Logs** | Implemented | Partially Complete | Logs scheme creation, updates, and deletion. Needs coverage for user status changes and configuration modifications. |
| **Multilingual Support (EN, KN, HI)** | Implemented | Partially Complete | Language switcher exists for English, Kannada, and Hindi; certain administrative and deep error strings lack complete translations. |
| **Janaseva Assistant & VoiceStudio** | Implemented | Auxiliary Functional | Text and voice assistance with language auto-detection and speech normalization; graceful fallback when local VoiceStudio is offline. |

---

## 3. Discovered Vulnerabilities & Security Findings

1. **Dual Database Files (`janaseva_db.json` split by process working directory):**
   - *Issue:* `path.resolve(process.cwd(), 'janaseva_db.json')` resolves to the root when launched from root (`npm run start`), and to `backend/janaseva_db.json` when launched from the backend directory (`cd backend && npm start`).
   - *Impact:* Root database contained 61 schemes and 2 users, while `backend/janaseva_db.json` contained 63 schemes and 8 test users. Admin updates in one mode do not reflect in the other.
   - *Severity:* **High (Data Inconsistency)**.

2. **Route Mount Discrepancy on Bookmark Toggle:**
   - *Issue:* `server.ts` mounted `['/api/user', '/api/users', '/api/v1/users']`, but `apiClient` defaults to `/api/v1`. Calling `/api/v1/user/saved-schemes/:id/toggle` returned 404, silently triggering frontend fallback to browser `localStorage` instead of server-side database persistence.
   - *Impact:* Citizen bookmarks saved via toggle could be lost upon browser cache clear or cross-device login.
   - *Severity:* **Medium (Persistence Failure)**.

3. **Fallback JWT Secret in Production Mode:**
   - *Issue:* `CONFIG.JWT_SECRET` in `backend/src/config.ts` emitted a console warning when running with the default secret in production, rather than strictly enforcing a mandatory cryptographically secure secret.
   - *Severity:* **Medium (Configuration Hygiene)**.

4. **Input Sanitization & Boundary Validation on Scheme Creation:**
   - *Issue:* Admin routes accepted raw array/string parameters for `benefits`, `requiredDocuments`, and `description` with variable fallback fields (`description || detailedDescription || briefDescription`) without strict sanitization against XSS in description fields.
   - *Severity:* **Medium (Security & Data Hygiene)**.

5. **Rate Limiting Configuration for Auth:**
   - *Issue:* Auth limiter had a ceiling of 1000 requests per 15 minutes during development. In production, brute-force protection must enforce 10-15 attempts per 15-minute window per IP.
   - *Severity:* **Low (Environment Configuration)**.

---

## 4. UI/UX Inconsistencies & Usability Issues

1. **Large JavaScript Bundle & Missing Code Splitting:**
   - *Issue:* In `App.tsx`, all pages (`AdminPage`, `CitizenDashboardPage`, `SchemesPage`, `EligibilityCheckerPage`, etc.) are imported synchronously. Vite emitted a bundle chunk warning (`index.js` > 670 kB).
   - *Solution:* Implement `React.lazy` and `Suspense` for heavy sub-pages (Admin, Citizen portal pages, Compliance, Compare) to ensure sub-second first-contentful paint.

2. **Saved Schemes Sync on Login:**
   - *Issue:* `savedSchemeIds` in `App.tsx` initialized once from `localStorage` on page load. When a user logged in, it did not automatically refresh with the citizen's authoritative server-side bookmarks from `/api/v1/users/me/bookmarks`.
   - *Solution:* Add an effect listening to `user` state change to hydrate `savedSchemeIds` directly from `api.getSavedSchemes()`.

3. **Eligibility History Auto-Record vs Manual Save:**
   - *Issue:* When a citizen performed an eligibility check, the backend logged an anonymous/user `assessment` in `assessments`, but `savedEligibilityRecords` required the user to manually click "Save to History".
   - *Solution:* Provide clear feedback that evaluation has been analyzed, allow 1-click persistence to citizen records, and display actionable reasons for qualifying or missing criteria.

4. **Admin User Management Search & Status Controls:**
   - *Issue:* Admin Users tab rendered a read-only list without search or filter controls, without user account status indicators (Active, Suspended), and without account inspection modal.
   - *Solution:* Add user search/filter, account status badges with toggle capability, and audit log generation on status change.

5. **Mobile Responsiveness & Table Overflow:**
   - *Issue:* Long administrative tables (Schemes and Users) relied purely on standard `overflow-x-auto` without optimized card views on small mobile viewports (<640px).

---

## 5. Backend, API, and Persistence Architecture Findings

1. **Database Adapter Architecture:**
   - The application relies on `janaseva_db.json` with an atomic write mechanism (`.tmp` file rename).
   - The PostgreSQL DDL (`backend/database/schema.sql`) is well-formed with relational integrity, cascading deletes, and indexes.
   - The storage layer must provide a single canonical path resolution for JSON file persistence (`JANASEVA_DB_PATH` or canonical project root resolution) to prevent split-brain database states.

2. **Error Handling & Response Consistency:**
   - Standardized API responses follow `{ success: boolean, message?: string, ...data }`.
   - 404 and 500 error handlers in Express are clean, but certain route catches need consistent logging with request context (request ID / timestamp).

3. **Eligibility Engine Rules:**
   - The eligibility engine checks state domicile, gender, min/max age, income ceiling, occupation, and education level.
   - Need comprehensive unit test suite covering:
     - 100% match on valid criteria.
     - Domicile exclusion on State-specific schemes (e.g. non-Karnataka resident on Gruha Lakshmi).
     - Income ceiling violation (e.g. ₹5,00,000 income on ₹2,50,000 threshold scheme).
     - Gender restrictions (e.g. Male applicant on Shakti or Gruha Lakshmi).
     - Edge cases (age boundaries, null/undefined inputs).

---

## 6. Actionable Upgrade Plan (Execution Strategy)

1. **Architecture & Persistence Unification:**
   - Synchronize all database records into one authoritative file.
   - Fix canonical database file path resolution in `db.ts` to never diverge regardless of runtime `cwd`.
   - Fix route mounting in `server.ts` to include `/api/v1/user` and ensure bookmark toggles always hit the backend.
   - Sync `savedSchemeIds` in `App.tsx` upon user authentication.

2. **Authentication & Security Hardening:**
   - Enforce robust password validation and sanitization.
   - Verify all admin API endpoints with explicit role checks.
   - Configure environment-aware rate limiting.

3. **Citizen Experience Enhancements:**
   - Unify Saved Schemes and ensure 100% backend persistence.
   - Polish Document Checklist with category summaries and print-friendly styling.
   - Ensure Eligibility History preserves full evaluation breakdown and allows one-click re-testing.

4. **Admin Command Center Upgrades:**
   - Implement user search, role/status filtering, and user account inspection.
   - Implement Scheme Archival (`isArchived`) and status filtering (All / Active / Draft / Archived).
   - Add verification administrator attribution and official source reference tracking.
   - Complete audit trail logging for all administrative operations.

5. **Performance & Code Quality:**
   - Code-split routes with `React.lazy` and `Suspense`.
   - Eliminate unused imports and standardize component styling with Tailwind.
   - Implement comprehensive unit tests for the Eligibility Engine.

6. **End-to-End Verification:**
   - Validate full citizen and admin workflows with automated integration scripts.
   - Verify zero console errors, clean TypeScript build, and production readiness.
