#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Address, String};
use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
    assert!(client.is_initialized());
    assert_eq!(client.get_admin(), admin);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
    client.initialize(&admin); // should panic: AlreadyInitialized = 1
}

#[test]
fn test_issue_and_verify_certificate() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set(LedgerInfo {
        timestamp: 1234567890,
        protocol_version: 25,
        sequence_number: 100,
        network_id: [0; 32],
        base_reserve: 10,
        min_persistent_entry_ttl: 10,
        min_temp_entry_ttl: 10,
        max_entry_ttl: 2000000,
    });
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-001");
    let meta_hash = String::from_str(&env, "a1b2c3d4e5f6");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &cert_id, &meta_hash);

    assert!(client.verify_certificate(&cert_id));

    let cert = client.get_certificate(&cert_id);
    assert_eq!(cert.student_wallet, student);
    assert_eq!(cert.metadata_hash, meta_hash);
    assert!(!cert.is_revoked);
    assert!(cert.issued_at > 0);
}

#[test]
fn test_revoke_certificate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-002");
    let meta_hash = String::from_str(&env, "abc123");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &cert_id, &meta_hash);
    client.revoke_certificate(&admin, &cert_id);

    assert!(!client.verify_certificate(&cert_id));

    let cert = client.get_certificate(&cert_id);
    assert!(cert.is_revoked);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_revoke_nonexistent_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let cert_id = String::from_str(&env, "NONEXISTENT");

    client.initialize(&admin);
    client.revoke_certificate(&admin, &cert_id); // should panic: CertificateNotFound = 4
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_duplicate_certificate_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-003");
    let meta_hash = String::from_str(&env, "abc123");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &cert_id, &meta_hash);
    client.issue_certificate(&admin, &student, &cert_id, &meta_hash); // should panic: CertificateAlreadyExists = 3
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_unauthorized_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let fake_admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-004");
    let meta_hash = String::from_str(&env, "abc123");

    client.initialize(&admin);
    client.issue_certificate(&fake_admin, &student, &cert_id, &meta_hash); // should panic: Unauthorized = 2
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_double_revoke_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-005");
    let meta_hash = String::from_str(&env, "abc123");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &cert_id, &meta_hash);
    client.revoke_certificate(&admin, &cert_id);
    client.revoke_certificate(&admin, &cert_id); // should panic: AlreadyRevoked = 5
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_get_nonexistent_certificate_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let cert_id = String::from_str(&env, "NONEXISTENT");
    client.get_certificate(&cert_id); // should panic: CertificateNotFound = 4
}

#[test]
fn test_verify_nonexistent_returns_false() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let cert_id = String::from_str(&env, "NONEXISTENT");
    assert!(!client.verify_certificate(&cert_id));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_empty_certificate_id_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let empty = String::from_str(&env, "");
    let hash = String::from_str(&env, "abc123");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &empty, &hash); // should panic: InvalidInput = 6
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_empty_metadata_hash_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let cert_id = String::from_str(&env, "CERT-001");
    let empty = String::from_str(&env, "");

    client.initialize(&admin);
    client.issue_certificate(&admin, &student, &cert_id, &empty); // should panic: InvalidInput = 6
}
