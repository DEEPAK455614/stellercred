# StellarCred — Blockchain Certificate Verification Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-00d4aa)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000)](https://nextjs.org)
[![Soroban](https://img.shields.io/badge/Soroban-v25-7c3aed)](https://soroban.stellar.org)

**StellarCred** is a Web3 certificate verification platform that issues tamper-proof academic credentials on the **Stellar blockchain** using **Soroban smart contracts**. Students own their certificates in their Freighter wallet, and anyone can verify authenticity publicly — no third party required.

---

## Problem Statement

Traditional paper-based certificates are easy to forge, difficult to verify, and prone to administrative errors. Employers and institutions spend significant resources verifying credentials. There is no standard, decentralized way to prove the authenticity of a certificate without contacting the issuing authority.

**StellarCred solves this** by storing cryptographic hashes of certificate metadata on the Stellar blockchain. Anyone can verify a certificate's authenticity by comparing the on-chain hash with the certificate data — no intermediary required.

---

## Features

- ✅ **Blockchain-Verified Certificates** — SHA-256 metadata hashes stored on Stellar Testnet via Soroban smart contracts
- ✅ **Freighter Wallet Integration** — Connect with the official Stellar wallet; private keys never leave the extension
- ✅ **Public Verification** — Anyone can verify a certificate by its ID — no wallet required
- ✅ **Admin Issuer Flow** — Authorized wallets can issue and revoke certificates
- ✅ **Student Dashboard** — Students see all certificates linked to their wallet
- ✅ **Certificate Details** — Full preview with verification status, transaction hash, and metadata hash
- ✅ **Transaction Audit Trail** — Every on-chain action is logged
- ✅ **Privacy First** — Only metadata hashes stored on-chain; full student data remains off-chain
- ✅ **Dark Theme UI** — Premium glassmorphism design, mobile-responsive
- ✅ **Demo-Ready** — Works with mock data for immediate demonstration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Stellar Testnet + Soroban Smart Contracts |
| **Smart Contract** | Rust, `soroban-sdk` v25 |
| **Frontend** | Next.js 16 (App Router), TypeScript |
| **Styling** | Tailwind CSS v4, Glassmorphism Design |
| **Wallet** | Freighter Browser Extension |
| **Stellar SDK** | `@stellar/stellar-sdk` v16 |
| **Build Tools** | Bun, Cargo |
| **Database** | PostgreSQL (Supabase-ready schema) |
| **Deployment** | Vercel (frontend), Stellar Testnet (contract) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    StellarCred Frontend                      │
│  (Next.js 16 + TypeScript + Tailwind CSS)                   │
│                                                             │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐        │
│  │ Landing │ │ Student  │ │ Admin   │ │ Verify   │        │
│  │ Page    │ │Dashboard │ │Dashboard│ │ Page     │        │
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘        │
│         │           │            │            │            │
│         ▼           ▼            ▼            ▼            │
│  ┌─────────────────────────────────────────────────┐       │
│  │              Next.js API Routes                  │       │
│  │  /api/certificates  /api/transactions  /api/admin│       │
│  └─────────────────────────────────────────────────┘       │
│         │                                          │       │
│         ▼                                          ▼       │
│  ┌──────────┐                              ┌──────────┐   │
│  │ In-Memory│◄───── DEMO MODE ────────────►│ Supabase │   │
│  │ Store    │                              │ (Future)  │   │
│  └──────────┘                              └──────────┘   │
└────────────────────────────────────────────────────────────┘
         │
         │ Freighter Wallet (signing)
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Stellar Testnet (Soroban)                       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │            StellarCred Smart Contract               │    │
│  │                                                    │    │
│  │  initialize()  issue_certificate()  revoke()       │    │
│  │  verify_certificate()  get_certificate()           │    │
│  └────────────────────────────────────────────────────┘    │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────┐  ┌──────────────┐                   │
│  │ Certificate Data │  │ Admin Config │                   │
│  │ (student_wallet, │  │ (admin addr) │                   │
│  │  metadata_hash,  │  └──────────────┘                   │
│  │  is_revoked,     │                                     │
│  │  issued_at)      │                                     │
│  └──────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### On-Chain vs Off-Chain

| Data | Location | Details |
|------|----------|---------|
| Certificate ID | On-chain | Unique identifier for the certificate |
| Student Wallet | On-chain | Stellar public key of the certificate recipient |
| Metadata Hash | On-chain | SHA-256 hash of full metadata JSON |
| Revocation Status | On-chain | Active or revoked |
| Issued Timestamp | On-chain | Block timestamp when issued |
| **Full Metadata** | **Off-chain** | Student name, title, issuer, description, etc. |
| **Transaction Logs** | **Off-chain** | Audit trail of all on-chain actions |
| **User Profiles** | **Off-chain** | Wallet-linked user information |

---

## Smart Contract Methods

### `initialize(admin: Address)`
Sets the contract admin/issuer. Can only be called once.

### `issue_certificate(admin, student_wallet, certificate_id, metadata_hash)`
Creates a new certificate record. Requires admin authorization. Stores student wallet, metadata hash, issued timestamp, and active status. Rejects duplicate certificate IDs.

### `verify_certificate(certificate_id) → bool`
Returns `true` if certificate exists and is active (not revoked). Returns `false` if revoked or not found. Read-only — no transaction fee.

### `revoke_certificate(admin, certificate_id)`
Marks a certificate as revoked. Requires admin authorization. Prevents double-revocation.

### `get_certificate(certificate_id) → Certificate`
Returns full on-chain certificate data: student wallet, metadata hash, revocation status, and issued timestamp.

### `get_admin() → Address`
Returns the contract admin address.

### `is_initialized() → bool`
Returns whether the contract has been initialized.

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 1 | AlreadyInitialized | Contract already initialized |
| 2 | Unauthorized | Caller is not the admin |
| 3 | CertificateAlreadyExists | Certificate ID already used |
| 4 | CertificateNotFound | No certificate with given ID |
| 5 | AlreadyRevoked | Certificate already revoked |
| 6 | InvalidInput | Empty certificate ID or metadata hash |

---

## Database Schema (Supabase)

### Tables

- **`users`** — Wallet-linked user profiles (wallet_address, full_name, role)
- **`certificates`** — Full certificate metadata with transaction references
- **`rewards`** — Student reward points linked to certificates
- **`transaction_logs`** — Audit trail for all on-chain actions

### Indexes

- `certificate_id` (unique)
- `student_wallet`
- `transaction_hash`
- `status`

See `supabase/schema.sql` for the complete schema.

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (or Bun)
- Rust + Cargo
- Freighter browser extension
- Stellar Testnet funded account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stellarcred.git
cd stellarcred
```

### 2. Install Frontend Dependencies

```bash
cd client
bun install
# or: npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section below.

### 4. Run Development Server

```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building the Soroban Contract

```bash
cd contract

# Build the contract
stellar contract build

# The WASM file will be at:
# target/wasm32v1-none/release/hello-world.wasm
```

### Running Contract Tests

```bash
cd contract
cargo test
```

All 12 tests should pass, covering:
- Initialization
- Certificate issuance and verification
- Certificate revocation
- Authorization checks
- Duplicate prevention
- Input validation
- Edge cases (not found, double revoke, invalid input)

---

## Deploying the Contract to Stellar Testnet

### 1. Install Stellar CLI

```bash
# Install via brew (macOS) or cargo
cargo install stellar-cli
```

### 2. Generate and Fund a Testnet Key

```bash
stellar keys generate dev --network testnet --fund
```

### 3. Deploy the Contract

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello-world.wasm \
  --source-account dev \
  --network testnet
```

This will output a contract ID (e.g., `CCJUX4PXTMOVEX33MC7BVOYFXO3WB5LOO7CHQLE7VMF3PJWQNKECGW7C`).

### 4. Initialize the Contract

```bash
# Set your wallet as admin
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account dev \
  --network testnet \
  -- \
  initialize \
  --admin <YOUR_STELLAR_PUBLIC_KEY>
```

### 5. Verify Deployment

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account dev \
  --network testnet \
  -- \
  is_initialized
```

### 6. Set Environment Variable

```bash
# In client/.env.local
NEXT_PUBLIC_CONTRACT_ID=<CONTRACT_ID>
```

---

## Connecting Freighter Wallet

1. Install the [Freighter browser extension](https://www.freighter.app/)
2. Create a new wallet or import an existing one
3. Switch to Stellar Testnet (Settings → Network → Testnet)
4. Fund your wallet using the [Stellar Testnet Friendbot](https://friendbot.stellar.org/)
5. Visit StellarCred → Click "Connect Wallet" → Approve in Freighter

---

## Deploying Frontend to Vercel

1. Push the repository to GitHub
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New → Project"
4. Import your GitHub repository
5. Set the following environment variables:
   - `NEXT_PUBLIC_STELLAR_NETWORK=testnet`
   - `NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org`
   - `NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org`
   - `NEXT_PUBLIC_CONTRACT_ID=<your-deployed-contract-id>`
   - `NEXT_PUBLIC_ADMIN_WALLETS=<your-wallet-address>`
   - `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
6. Click "Deploy"

---

## Demo Script

### Quick Demo (5 minutes)

1. **Open** StellarCred in your browser
2. **Click** "Connect Wallet" → Approve the Freighter prompt
3. **Navigate** to Admin Dashboard → Verify your wallet address shows admin badge
4. **Click** "Issue Certificate" from the admin sidebar
5. **Fill** the form with demo data:
   - Student Name: `Alice Johnson`
   - Student Wallet: `G...` (your wallet or test address)
   - Certificate Title: `Advanced Blockchain Development`
   - Issuer Name: `Stellar University`
   - Event Name: `Web3 Bootcamp 2025`
   - Certificate ID: Click "Generate" or enter `CERT-DEMO-001`
6. **Click** "Issue Certificate" → Watch the transaction flow progress
7. **After success**, you're redirected to the certificate detail page showing "Verified"
8. **Copy** the certificate link and open it in an incognito window → it shows as verified
9. **Navigate** to Admin → Revoke the certificate → Refresh the detail page → Shows "Revoked"
10. **Visit** `/verify` → Enter `CERT-DEMO-001` → See complete verification result

### Demo Mode

The app runs in `DEMO_MODE` by default, which simulates on-chain transactions without requiring an actual deployed contract. Set `DEMO_MODE = false` in `src/lib/constants.ts` for real on-chain interactions.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network (`testnet` or `mainnet`) | Yes |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint | Yes |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Horizon API endpoint | Yes |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed Soroban contract ID | For real on-chain |
| `NEXT_PUBLIC_ADMIN_WALLETS` | Comma-separated admin wallet addresses | For admin auth |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For production DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | For production DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | For production DB |
| `NEXT_PUBLIC_APP_URL` | App URL for share links | For share feature |

---

## Project Structure

```
stellarcred/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── wallet/              # Wallet connect page
│   │   │   ├── dashboard/
│   │   │   │   ├── student/         # Student dashboard
│   │   │   │   └── admin/           # Admin dashboard
│   │   │   ├── issue/               # Issue certificate form
│   │   │   ├── certificate/         # Certificate detail
│   │   │   ├── verify/              # Public verification
│   │   │   ├── docs/                # Documentation
│   │   │   └── api/                 # Next.js API routes
│   │   ├── components/              # Reusable UI components
│   │   └── lib/                     # Utility libraries
│   ├── supabase/schema.sql          # Database schema
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── contract/                        # Soroban smart contract
│   ├── contracts/contract/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs               # Contract implementation
│   │       └── test.rs              # Contract tests
│   └── Cargo.toml                   # Workspace config
│
└── README.md
```

---

## Screenshots

*[Screenshots coming soon — see the live demo or run locally to explore the UI]*

---

## Future Improvements

- [ ] Real Supabase integration for persistent data storage
- [ ] Certificate expiry notifications via email
- [ ] Batch certificate issuance (CSV upload)
- [ ] QR code generation for each certificate
- [ ] Verifiable Credentials (VC) standard compliance
- [ ] Stellar mainnet deployment
- [ ] Mobile app with WalletConnect
- [ ] DAO-governed admin management
- [ ] Integration with LMS platforms (Canvas, Moodle)
- [ ] Automated issuer reputation scoring

---

## Troubleshooting

### Build Issues

**Problem**: Next.js build fails with TypeScript errors
**Solution**: Ensure all dependencies are installed: `bun install`

### Contract Issues

**Problem**: `cargo test` fails
**Solution**: Ensure you have the Rust target installed:
```bash
rustup target add wasm32v1-none
```

### Wallet Issues

**Problem**: Freighter not detected
**Solution**: Install the [Freighter extension](https://www.freighter.app/) and ensure it's enabled

**Problem**: Transaction signing fails
**Solution**: Ensure your wallet is funded on Stellar Testnet and you have sufficient XLM for fees

### API Issues

**Problem**: API routes return empty data in production
**Solution**: The app uses in-memory storage by default. For production, integrate Supabase as the data store.

---

## License

MIT

---

## Acknowledgments

- Built on [Stellar](https://stellar.org) and [Soroban](https://soroban.stellar.org)
- Wallet integration via [Freighter](https://www.freighter.app/)
- Stellar SDK by [Stellar Development Foundation](https://stellar.org)
- Smart contract framework by [Stellar](https://github.com/stellar/soroban-examples)
