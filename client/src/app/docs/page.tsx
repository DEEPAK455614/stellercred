"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";

const sections = [
  {
    title: "Problem Statement",
    content: `Traditional paper-based certificates are easy to forge, difficult to verify, and prone to administrative errors. 
    Employers and institutions spend significant time and resources verifying credentials. There is no standard, 
    decentralized way to prove the authenticity of a certificate without contacting the issuing authority.

StellarCred solves this by storing cryptographic hashes of certificate metadata on the Stellar blockchain. 
Anyone can verify a certificate's authenticity by comparing the on-chain hash with the certificate data — 
no intermediary required.`,
  },
  {
    title: "Architecture Overview",
    content: `The platform uses a hybrid on-chain / off-chain architecture:

ON-CHAIN (Stellar Testnet — Soroban Smart Contract):
• Certificate ID, student wallet address, and SHA-256 metadata hash
• Issuance and revocation status
• Admin/issuer authorization

OFF-CHAIN (Next.js API + Database):
• Full certificate metadata (student name, title, issuer, description)
• Transaction logs
• User profiles
• Application state and statistics

This hybrid approach balances transparency with privacy — sensitive student data stays off-chain while 
cryptographic proof of authenticity is publicly verifiable on the blockchain.`,
  },
  {
    title: "Smart Contract Methods",
    content: `The Soroban smart contract (written in Rust) exposes the following functions:

1. initialize(admin: Address)
   • Sets the contract admin/issuer
   • Can only be called once

2. issue_certificate(admin, student_wallet, certificate_id, metadata_hash)
   • Creates a new certificate record
   • Requires admin authorization
   • Stores: student wallet, metadata hash, issued timestamp, active status
   • Rejects duplicate certificate IDs

3. verify_certificate(certificate_id) → bool
   • Returns true if certificate exists and is active
   • Returns false if revoked or not found
   • Read-only — no transaction fee

4. revoke_certificate(admin, certificate_id)
   • Marks a certificate as revoked
   • Requires admin authorization
   • Prevents double-revocation

5. get_certificate(certificate_id) → Certificate
   • Returns full certificate data from the blockchain
   • Student wallet, metadata hash, revocation status, issued timestamp

6. get_admin() → Address
   • Returns the contract admin address

7. is_initialized() → bool
   • Returns whether the contract has been initialized`,
  },
  {
    title: "Error Handling",
    content: `The contract defines the following error codes:
• AlreadyInitialized (1) — Contract already initialized
• Unauthorized (2) — Caller is not the admin
• CertificateAlreadyExists (3) — Certificate ID already used
• CertificateNotFound (4) — No certificate with the given ID
• AlreadyRevoked (5) — Certificate already revoked
• InvalidInput (6) — Empty certificate ID or metadata hash`,
  },
  {
    title: "Database Schema",
    content: `The database uses four main tables:

1. users — Wallet-linked user profiles (wallet_address, full_name, role)
2. certificates — Full certificate metadata (certificate_id, student_wallet, student_name, title, issuer_name, metadata_hash, transaction_hash, status)
3. rewards — Student rewards/points linked to certificates
4. transaction_logs — Audit trail for all on-chain actions

Key indexes: certificate_id (unique), student_wallet, transaction_hash, status`,
  },
  {
    title: "Wallet Flow",
    content: `1. User installs Freighter browser extension
2. User creates or imports a Stellar Testnet wallet
3. User clicks "Connect Wallet" on StellarCred
4. Freighter prompts for permission — user approves
5. App receives the public key (G... address)
6. For state-changing operations (issue, revoke):
   • App builds a Soroban contract transaction
   • Freighter prompts user to sign
   • Transaction is submitted to Stellar Testnet
   • App polls for confirmation
7. Read operations (verify) do not require signing

Security: Private keys never leave Freighter. All signing happens in the extension.`,
  },
  {
    title: "Tech Stack",
    content: `• Blockchain: Stellar Testnet + Soroban Smart Contracts (Rust)
• Smart Contract SDK: soroban-sdk v25
• Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
• Wallet: Freighter Browser Extension
• Stellar SDK: @stellar/stellar-sdk v16
• Styling: Glassmorphism design system, dark theme
• Database: PostgreSQL (Supabase-ready schema)
• Build: bun, Rust/Cargo
• Deployment: Vercel (frontend), Stellar Testnet (contract)`,
  },
  {
    title: "Deployment Instructions",
    content: `Frontend (Vercel):
1. Push code to GitHub repository
2. Import repo into Vercel
3. Set environment variables (see .env.example)
4. Deploy — zero configuration needed

Smart Contract (Stellar Testnet):
1. Ensure Rust + soroban-cli installed
2. cd contracts/stellarcred
3. stellar contract build
4. stellar keys generate dev --network testnet --fund
5. stellar contract deploy --wasm target/wasm32v1-none/release/hello-world.wasm --source-account dev --network testnet
6. Copy contract ID to NEXT_PUBLIC_CONTRACT_ID

Verify deployed contract:
• stellar contract invoke --id <CONTRACT_ID> --source-account dev --network testnet -- is_initialized

Initialize admin:
• stellar contract invoke --id <CONTRACT_ID> --source-account dev --network testnet -- initialize --admin <ADMIN_ADDRESS>`,
  },
  {
    title: "Demo Script",
    content: `1. Open StellarCred in browser
2. Click "Connect Wallet" → Approve in Freighter
3. Navigate to Admin Dashboard → Verify your wallet shows admin badge
4. Click "Issue Certificate"
5. Fill form with demo data:
   • Student: Alice Johnson
   • Wallet: G... (same or different from admin)
   • Title: Advanced Blockchain Development Certificate
   • Issuer: Stellar University
   • Event: Web3 Bootcamp 2025
   • ID: Click "Generate" or enter CERT-DEMO-001
6. Click "Issue Certificate" → Observe transaction flow
7. After success, you're redirected to the certificate detail page
8. Copy the certificate link and open in incognito
9. Verify the certificate shows as "Verified"
10. As admin, navigate to admin dashboard → revoke the certificate
11. Refresh the certificate page → Status shows "Revoked"
12. Navigate to /verify → Enter certificate ID → See verification result`,
  },
  {
    title: "Future Improvements",
    content: `• Real Supabase integration for persistent data storage
• Certificate expiry notifications via email
• Batch certificate issuance (CSV upload)
• QR code generation for certificates
• Verifiable Credentials (VC) standard compliance
• Stellar mainnet deployment
• Mobile app with WalletConnect
• DAO-governed admin management
• Automatic issuer reputation scoring
• Integration with LMS platforms (Canvas, Moodle)`,
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <PageHeader
            title="Documentation"
            description="Complete guide to the StellarCred platform architecture, smart contract, and usage."
          />

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i} className="glass-card animate-fade-in rounded-xl p-6" style={{ animationDelay: `${i * 50}ms` }}>
                <h2 className="mb-3 text-lg font-semibold text-white">
                  {section.title}
                </h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-gray-400">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
