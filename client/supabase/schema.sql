-- ============================================================
-- StellarCred — Supabase PostgreSQL Schema
-- Blockchain Certificate Verification & Student Reward Platform
-- ============================================================

-- 1. USERS TABLE
-- Stores wallet-linked user profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(56) NOT NULL UNIQUE, -- Stellar public key (G...)
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'issuer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);

-- 2. CERTIFICATES TABLE
-- Stores full certificate metadata; only the hash is stored on-chain
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(64) NOT NULL UNIQUE, -- Human-readable ID (e.g., CERT-001)
    student_wallet VARCHAR(56) NOT NULL,        -- Stellar public key of student
    student_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    issuer_name VARCHAR(255) NOT NULL,
    event_name VARCHAR(255),
    description TEXT,
    metadata_json TEXT NOT NULL,                 -- Full JSON metadata
    metadata_hash VARCHAR(64) NOT NULL,          -- SHA-256 hex hash
    transaction_hash VARCHAR(64),                -- Stellar transaction hash
    contract_id VARCHAR(56),                     -- Soroban contract ID
    status VARCHAR(20) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_certificates_id ON certificates(certificate_id);
CREATE INDEX idx_certificates_student ON certificates(student_wallet);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_tx_hash ON certificates(transaction_hash);
CREATE INDEX idx_certificates_contract ON certificates(contract_id);

-- 3. REWARDS TABLE
-- Tracks student rewards/points linked to certificates
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_wallet VARCHAR(56) NOT NULL,
    reward_type VARCHAR(50) NOT NULL DEFAULT 'achievement',
    points INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    certificate_id VARCHAR(64) REFERENCES certificates(certificate_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_student ON rewards(student_wallet);
CREATE INDEX idx_rewards_certificate ON rewards(certificate_id);

-- 4. TRANSACTION LOGS TABLE
-- Logs every on-chain interaction for audit trail
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash VARCHAR(64),
    wallet_address VARCHAR(56) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('issue', 'revoke', 'verify')),
    certificate_id VARCHAR(64),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_logs_hash ON transaction_logs(transaction_hash);
CREATE INDEX idx_tx_logs_wallet ON transaction_logs(wallet_address);
CREATE INDEX idx_tx_logs_status ON transaction_logs(status);
CREATE INDEX idx_tx_logs_action ON transaction_logs(action_type);

-- Enable Row-Level Security (RLS) on all tables
-- Policies should be configured in Supabase dashboard:
--   - users: users can read/update their own row (wallet_address match)
--   - certificates: public can read, admin/issuer can insert/update
--   - rewards: students can read their own, admin can manage
--   - transaction_logs: admin can read all, students can read their own
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
