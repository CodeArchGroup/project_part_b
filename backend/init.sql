-- ============================================
-- ITQAN PostgreSQL Schema Initialization
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5. Shariah Rules (created first — referenced by advice)
CREATE TABLE IF NOT EXISTS shariah_rules (
    rule_id          VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category         VARCHAR(100),
    description      TEXT,
    source_reference VARCHAR(255)
);

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    user_id       VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(50),
    address_state VARCHAR(100),
    address_zip   VARCHAR(20),
    user_type     VARCHAR(20) DEFAULT 'User' CHECK (user_type IN ('User', 'Admin')),
    created_date  TIMESTAMP DEFAULT NOW()
);

-- 2. Financial Profiles
CREATE TABLE IF NOT EXISTS financial_profiles (
    profile_id   VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id      VARCHAR(128) UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    income       NUMERIC(15,2) DEFAULT 0,
    assets       NUMERIC(15,2) DEFAULT 0,
    liabilities  NUMERIC(15,2) DEFAULT 0,
    savings      NUMERIC(15,2) DEFAULT 0,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- 3. Financial Goals
CREATE TABLE IF NOT EXISTS financial_goals (
    goal_id        VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id        VARCHAR(128) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_type      VARCHAR(50),
    target_amount  NUMERIC(15,2),
    current_amount NUMERIC(15,2) DEFAULT 0,
    status         VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
    deadline       DATE,
    created_date   TIMESTAMP DEFAULT NOW(),
    updated_date   TIMESTAMP DEFAULT NOW()
);

-- 4. Advice
CREATE TABLE IF NOT EXISTS advice (
    advice_id    VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id      VARCHAR(128) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    advice_type  VARCHAR(100),
    description  TEXT,
    created_date TIMESTAMP DEFAULT NOW(),
    rule_id      VARCHAR(128) REFERENCES shariah_rules(rule_id)
);

-- 6. Admin
CREATE TABLE IF NOT EXISTS admins (
    admin_id   VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    role       VARCHAR(50) DEFAULT 'Moderator' CHECK (role IN ('Super Admin','Moderator')),
    last_login TIMESTAMP
);

-- 7. System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    log_id      VARCHAR(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     VARCHAR(128) REFERENCES users(user_id) ON DELETE SET NULL,
    action_type VARCHAR(100),
    timestamp   TIMESTAMP DEFAULT NOW(),
    details     TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_profiles_user ON financial_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user    ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_user             ON advice(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user        ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp   ON system_logs(timestamp);
