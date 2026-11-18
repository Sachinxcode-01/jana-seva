# JANASEVA – Government Scheme Awareness for Betterment of Livelihood

> **Computer Science & Engineering — Computer-Based Project (CBP)**  
> **Academic Session 2026**

---

## 🏛️ Project Abstract

**JANASEVA** is a modern, responsive, and secure full-stack civic technology web portal designed to bridge the information gap for citizens—especially farmers, rural communities, women, and students. The portal empowers citizens to discover verified Central and Karnataka State government welfare programs, evaluate their eligibility in real-time through an interactive rule engine, access authentic required document checklists, and navigate directly to official government application portals without fraudulent intermediaries.

---

## 🌟 Key Features

1. **Government Scheme Directory**:
   - Comprehensive repository covering **Women Empowerment**, **Student Scholarships**, **Farmer Welfare**, **Employment Opportunities**, **Financial Assistance**, and **Health and Social Welfare**.
   - Verified sample programs including:
     - *Gruha Lakshmi Yojana* (Karnataka)
     - *Shakti Scheme* (Karnataka)
     - *State Scholarship Portal (SSP)* (Karnataka)
     - *National Scholarship Portal (NSP)* (Central)
     - *PM-KISAN Samman Nidhi* (Central)
     - *Pradhan Mantri Fasal Bima Yojana (PMFBY)* (Central)
     - *Ayushman Bharat – PM-JAY (Arogya Karnataka)* (Central)
     - *PM SVANidhi* (Central)
     - *Yuva Nidhi Scheme* (Karnataka)
     - *Pradhan Mantri MUDRA Yojana (PMMY)* (Central)

2. **Advanced Multi-Facet Search & Filtering**:
   - Live text search across titles, departments, and descriptions.
   - Filters by **Classification** (Central vs. Karnataka State), **Category**, **Target Beneficiary**, and **Sorting** (Recently Updated, Most Viewed, Alphabetical).

3. **Smart Interactive Eligibility Checker**:
   - 3-step privacy-safe wizard evaluating age, gender, state domicile, occupation, beneficiary category, and annual family income.
   - Computes Match Score %, qualifying conditions, missing requirements, and document checklists.
   - Includes official disclaimer regarding preliminary advisory status.
   - **Zero sensitive data collection**: Never asks for Aadhaar numbers or bank account credentials.

4. **Scheme Comparison Matrix**:
   - Side-by-side comparison of 2 or 3 selected welfare schemes across benefits, income ceilings, age criteria, and documents.

5. **Multilingual Inclusivity (3 Languages)**:
   - Full native support for **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिंदी)** with appropriate Unicode typography.

6. **Citizen Application Tracker**:
   - Allows citizens to maintain their personal submission ledger with official application reference numbers, submission dates, status updates (*Draft*, *Submitted*, *In Review*, *Approved*, *Rejected*), and notes.

7. **Janaseva Assistant (AI Chatbot)**:
   - Multilingual conversational assistant answering scheme-specific queries, document checklists, and application steps based strictly on verified scheme knowledge.

8. **Administrative Command Center**:
   - Visual analytics powered by **Recharts**: Category Distribution Chart, Most Viewed Schemes Traffic Chart, and Central vs. State Breakdown.
   - Complete CRUD operations: Add new schemes, update existing schemes, delete schemes, and view system audit activity logs.

---

## 💻 Technology Stack

### Frontend:
- **Framework**: React.js 18 with TypeScript
- **Styling**: Tailwind CSS (Civic Indian Public Service Design System)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Internationalization**: Custom Context i18n (English, Kannada, Hindi)
- **Build Tool**: Vite

### Backend:
- **Runtime**: Node.js (v22 / v25)
- **Server Framework**: Express.js with TypeScript
- **Authentication**: JSON Web Tokens (JWT) & BCrypt password hashing
- **Architecture**: Modular RESTful APIs with controllers, routes, and services
- **Rule Engine**: Deterministic eligibility evaluation algorithms

### Database:
- **Relational Schema**: PostgreSQL DDL (`backend/database/schema.sql`)
- **Persistence Layer**: Structured transactional JSON store (`janaseva_db.json`) with zero external dependency for instantaneous lab demonstration.

---

## 🚀 Quick Start Guide (For Lab Presentation)

### Prerequisites:
- **Node.js** (v18 or higher installed)
- **npm** (comes with Node.js)

### Step 1: Start the Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
*The backend REST API will start on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

### Step 2: Start the Frontend Application (Terminal 2)
```bash
cd frontend
npm run dev
```
*The frontend web portal will launch on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials for Lab Evaluation

To easily demonstrate both **Citizen** and **Administrator** views during the examination, you can use the **1-Click Demo Login** buttons inside the Login dialog, or enter:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@janaseva.gov.in` | `Citizen@123` | Dashboard, Saved Bookmarks, Application Tracker |
| **Administrator** | `admin@janaseva.gov.in` | `Admin@123` | Admin Analytics, Recharts Graphs, Scheme Management, Audit Logs |

---

## 📂 Project Structure

```
Jana-Seva/
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT & Auth Middleware
│   │   ├── database/          # Persistent Data Store & Seed
│   │   ├── routes/            # REST API Route Handlers
│   │   │   ├── authRoutes.ts
│   │   │   ├── schemeRoutes.ts
│   │   │   ├── eligibilityRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── assistantRoutes.ts
│   │   ├── services/          # Eligibility Engine & AI Assistant
│   │   ├── config.ts          # Environment & Ports
│   │   ├── server.ts          # Express Server Entry Point
│   │   └── types.ts           # Shared TypeScript Interfaces
│   ├── database/
│   │   └── schema.sql         # PostgreSQL Database Schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SchemeCard.tsx
│   │   │   ├── SchemeDetailsModal.tsx
│   │   │   ├── JanasevaAssistant.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── context/           # Auth & Multilingual Contexts
│   │   ├── pages/             # Portal Views
│   │   │   ├── HomePage.tsx
│   │   │   ├── SchemesPage.tsx
│   │   │   ├── EligibilityCheckerPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── ContactPage.tsx
│   │   ├── services/          # API Client & Offline Fallback Data
│   │   ├── utils/             # English, Kannada, Hindi Translations
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── package.json               # Root scripts
└── README.md                  # Project Documentation
```

---

## 🛡️ Public Advisory & Compliance Notice

JANASEVA adheres to public digital governance standards:
- All scheme guidelines, documents, and benefits are verified against published government notifications.
- The portal does **NOT** collect sensitive personal identification numbers (e.g. Aadhaar numbers or bank credentials).
- Preliminary eligibility ratings do not substitute official administrative approval.
