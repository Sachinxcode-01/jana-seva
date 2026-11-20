-- ====================================================================
-- JANASEVA - Government Scheme Awareness & Livelihood Assistance Portal
-- Relational Database Schema (PostgreSQL DDL)
-- Production Citizen Portal & Public Governance Architecture
-- ====================================================================

CREATE TYPE role_type AS ENUM ('citizen', 'admin');

CREATE TYPE classification_type AS ENUM ('Central', 'State');

CREATE TYPE application_status AS ENUM ('Draft', 'Submitted', 'In Review', 'Approved', 'Rejected');

CREATE TYPE document_status AS ENUM ('available', 'pending', 'not_applicable');

CREATE TYPE document_category AS ENUM ('Identity', 'Income', 'Residence', 'Education', 'Category', 'Banking', 'Income & Caste', 'Agriculture & Land', 'Other');

-- 1. Users & Citizen Profiles Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role role_type DEFAULT 'citizen',
    state VARCHAR(100) DEFAULT 'Karnataka',
    district VARCHAR(100) DEFAULT 'Bengaluru Urban',
    village_town VARCHAR(150),
    occupation VARCHAR(100) DEFAULT 'General Citizen',
    beneficiary_category VARCHAR(100) DEFAULT 'General',
    income_range VARCHAR(100) DEFAULT 'Below 2.5 Lakhs',
    gender VARCHAR(20) DEFAULT 'Other',
    preferred_language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{"language": "en", "emailNotifications": true, "smsNotifications": false, "schemeUpdates": true, "theme": "dark"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_mobile ON users (mobile_number);

CREATE INDEX idx_users_role ON users (role);

-- 2. User Active Sessions Table (Security & Multi-device Audit)
CREATE TABLE user_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users (id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    user_agent VARCHAR(500),
    logged_in_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions (user_id);

-- 3. Schemes Table
CREATE TABLE schemes (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255),
    name_hi VARCHAR(255),
    department VARCHAR(255) NOT NULL,
    classification classification_type DEFAULT 'Central',
    state VARCHAR(100) DEFAULT 'All India',
    category VARCHAR(100) NOT NULL,
    beneficiary_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    description_kn TEXT,
    description_hi TEXT,
    benefits JSONB NOT NULL,
    eligibility_criteria JSONB NOT NULL,
    required_documents JSONB NOT NULL,
    application_procedure JSONB NOT NULL,
    official_website VARCHAR(500) NOT NULL,
    deadline VARCHAR(255),
    last_updated DATE DEFAULT CURRENT_DATE,
    is_verified BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    source_verification_status VARCHAR(100) DEFAULT 'Official Government Verified',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schemes_category ON schemes (category);

CREATE INDEX idx_schemes_classification ON schemes (classification);

CREATE INDEX idx_schemes_slug ON schemes (slug);

CREATE INDEX idx_schemes_state ON schemes (state);

-- 4. Saved Schemes / Bookmarks Table
CREATE TABLE saved_schemes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users (id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes (id) ON DELETE CASCADE,
    saved_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_scheme UNIQUE (user_id, scheme_id)
);

CREATE INDEX idx_saved_schemes_user ON saved_schemes (user_id);

-- 5. Citizen Application Tracker Table
CREATE TABLE application_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes(id) ON DELETE CASCADE,
    application_ref_no VARCHAR(100) NOT NULL,
    applied_date DATE NOT NULL,
    status application_status DEFAULT 'Submitted',
    notes TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_user ON application_records (user_id);

CREATE INDEX idx_applications_ref_no ON application_records (application_ref_no);

CREATE INDEX idx_applications_status ON application_records (status);

-- 6. Citizen Document Preparation Checklist Table
CREATE TABLE user_documents (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category document_category NOT NULL,
    status document_status DEFAULT 'pending',
    document_number VARCHAR(100),
    notes TEXT,
    updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user ON user_documents (user_id);

-- 7. Saved Eligibility Evaluation History Table
CREATE TABLE saved_eligibility_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes(id) ON DELETE CASCADE,
    scheme_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    match_score INT NOT NULL,
    is_eligible BOOLEAN NOT NULL,
    matching_reasons JSONB DEFAULT '[]'::jsonb,
    unmet_conditions JSONB DEFAULT '[]'::jsonb,
    required_documents JSONB DEFAULT '[]'::jsonb,
    input_criteria JSONB NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eligibility_history_user ON saved_eligibility_history (user_id);

-- 8. Global Eligibility Assessments (Anonymous & Authenticated telemetry)
CREATE TABLE eligibility_assessments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users (id) ON DELETE SET NULL,
    input_criteria JSONB NOT NULL,
    eligible_schemes_count INT DEFAULT 0,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_kn VARCHAR(255),
    title_hi VARCHAR(255),
    message TEXT NOT NULL,
    message_kn TEXT,
    message_hi TEXT,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications (user_id);

CREATE INDEX idx_notifications_read ON notifications (is_read);

-- 10. Admin Activity Logs Table
CREATE TABLE admin_logs (
    id VARCHAR(50) PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_timestamp ON admin_logs (timestamp);