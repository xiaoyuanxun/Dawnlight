use crate::utils::build_local_agent;
use crate::{
    LOCAL_BUCKET_CANISTER_TEXT, 
    LOCAL_BODHI_CANISTER_TEXT,
    USERA
};
use candid::{Principal, Encode, Nat, Decode};
use serde_bytes::ByteBuf;
use crate::bucket_did;
use crate::bodhi_did;

pub async fn test_store_file() {
    let canister = Principal::from_text(LOCAL_BUCKET_CANISTER_TEXT).unwrap();

    let response_blob = build_local_agent("identity/1.pem").await
        .update(
            &canister,
            "store"
        )
        .with_arg(Encode!(
            &bucket_did::StoreArgs {
                key: "1".to_string(),
                value: ByteBuf::from("AAAAAAAA"),
                total_index: Nat::from(1usize),
                file_type: "txt".to_string(),
                total_size: ByteBuf::from("AAAAAAAA").len() as u64,
                index: Nat::from(0usize)
            }
        ).unwrap())
        .call_and_wait()
        .await
        .expect("Call Response Error !");
    let result = Decode!(&response_blob, ()).unwrap();
    println!("result : {:?}", result);
}

pub async fn test_create() {
    let create_result = bodhi_did::create(
        Principal::from_text(LOCAL_BODHI_CANISTER_TEXT).unwrap(),
        build_local_agent(USERA).await, 
        "1".to_string()).await;
    println!("create_result : {:?}", create_result);
}
