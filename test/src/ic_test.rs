use std::result;

use crate::utils::build_agent;
use crate::{IC_BUCKET_CANISTER_TEXT, IC_BODHI_CANISTER_TEXT};
use candid::{Principal, Encode, Nat, Decode};

use serde_bytes::ByteBuf;
use crate::bucket_did;

pub async fn test_store_file() {
    let canister = Principal::from_text(IC_BUCKET_CANISTER_TEXT).unwrap();

    bucket_did::store(canister, build_agent("identity/1.pem"), "UDC_ySyfzfhnEI5SyU0QH".to_string(), "./image.png").await;
}

pub async fn test_create() {
    
}
