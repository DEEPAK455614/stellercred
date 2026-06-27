#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, String};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    CertificateAlreadyExists = 3,
    CertificateNotFound = 4,
    AlreadyRevoked = 5,
    InvalidInput = 6,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Certificate {
    pub student_wallet: Address,
    pub metadata_hash: String,
    pub is_revoked: bool,
    pub issued_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Initialized,
    Certificate(String),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().persistent().has(&DataKey::Initialized) {
            panic_with_error!(&env, ContractError::AlreadyInitialized);
        }
        env.storage().persistent().set(&DataKey::Initialized, &true);
        env.storage().persistent().set(&DataKey::Admin, &admin);
    }

    pub fn is_initialized(env: Env) -> bool {
        env.storage().persistent().has(&DataKey::Initialized)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().persistent().get(&DataKey::Admin).expect("not initialized")
    }

    pub fn issue_certificate(
        env: Env,
        admin: Address,
        student_wallet: Address,
        certificate_id: String,
        metadata_hash: String,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().persistent().get(&DataKey::Admin).expect("not initialized");
        if admin != stored_admin {
            panic_with_error!(&env, ContractError::Unauthorized);
        }
        if certificate_id.is_empty() || metadata_hash.is_empty() {
            panic_with_error!(&env, ContractError::InvalidInput);
        }
        if env.storage().persistent().has(&DataKey::Certificate(certificate_id.clone())) {
            panic_with_error!(&env, ContractError::CertificateAlreadyExists);
        }
        let cert = Certificate {
            student_wallet,
            metadata_hash,
            is_revoked: false,
            issued_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Certificate(certificate_id), &cert);
    }

    pub fn verify_certificate(env: Env, certificate_id: String) -> bool {
        let cert: Option<Certificate> = env.storage().persistent().get(&DataKey::Certificate(certificate_id));
        match cert {
            Some(c) => !c.is_revoked,
            None => false,
        }
    }

    pub fn revoke_certificate(env: Env, admin: Address, certificate_id: String) {
        admin.require_auth();
        let stored_admin: Address = env.storage().persistent().get(&DataKey::Admin).expect("not initialized");
        if admin != stored_admin {
            panic_with_error!(&env, ContractError::Unauthorized);
        }
        let mut cert: Certificate = env.storage().persistent()
            .get(&DataKey::Certificate(certificate_id.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::CertificateNotFound));
        if cert.is_revoked {
            panic_with_error!(&env, ContractError::AlreadyRevoked);
        }
        cert.is_revoked = true;
        env.storage().persistent().set(&DataKey::Certificate(certificate_id), &cert);
    }

    pub fn get_certificate(env: Env, certificate_id: String) -> Certificate {
        env.storage().persistent()
            .get(&DataKey::Certificate(certificate_id))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::CertificateNotFound))
    }
}

mod test;
