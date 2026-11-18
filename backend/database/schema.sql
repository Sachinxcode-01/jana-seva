-- ====================================================================
-- JANASEVA - Government Scheme Awareness & Livelihood Assistance Portal
-- Relational Database Schema (PostgreSQL DDL)
-- ====================================================================

CREATE TYPE role_type AS ENUM ('citizen', 'admin');
CREATE TYPE classification_type AS ENUM ('Central', 'State');
CREATE TYPE application_status AS ENUM ('Draft', 'Submitted', 'In Review', 'Approved', 'Rejected');

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_type DEFAULT 'citizen',
    state VARCHAR(100) DEFAULT 'Karnataka',
    occupation VARCHAR(100),
    income_range VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Schemes Table
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
    last_updated DATE DEFAULT CURRENT_DATE,
    is_verified BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    source_verification_status VARCHAR(100) DEFAULT 'Official Government Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_classification ON schemes(classification);
CREATE INDEX idx_schemes_slug ON schemes(slug);

-- 3. Saved Schemes Table
CREATE TABLE saved_schemes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_scheme UNIQUE(user_id, scheme_id)
);

-- 4. Application Tracking Table
CREATE TABLE application_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes(id) ON DELETE CASCADE,
    application_ref_no VARCHAR(100) NOT NULL,
    applied_date DATE NOT NULL,
    status application_status DEFAULT 'Submitted',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_user ON application_records(user_id);

-- 5. Eligibility Assessments Table
CREATE TABLE eligibility_assessments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    input_criteria JSONB NOT NULL,
    eligible_schemes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_kn VARCHAR(255),
    title_hi VARCHAR(255),
    message TEXT NOT NULL,
    message_kn TEXT,
    message_hi TEXT,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin Activity Logs Table
CREATE TABLE admin_logs (
    id VARCHAR(50) PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
