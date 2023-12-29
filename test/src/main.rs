mod utils;
mod local_test;
mod bucket_did;
mod ic_test;
mod icrc_did;
mod bodhi_did;
use candid::{Principal, Encode, Decode};

// use crate::did::{};
use crate::utils::build_agent;

pub const LOCAL_BUCKET_CANISTER_TEXT: &str = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
pub const LOCAL_BODHI_CANISTER_TEXT: &str = "br5f7-7uaaa-aaaaa-qaaca-cai";

pub const IC_BUCKET_CANISTER_TEXT: &str = "r4yar-zqaaa-aaaan-qlfja-cai";
pub const IC_BODHI_CANISTER_TEXT: &str = "";

pub const USERA: &str = "identity/1.pem";
pub const USERB: &str = "identity/2.pem";
pub const USERC: &str = "identity/3.pem";
pub const USERD: &str = "identity/4.pem";
pub const USERE: &str = "identity/5.pem";

// pub async fn call_canister() {
//     let canister = Principal::from_text("").unwrap();
    
//     let response_blob = build_agent("./identity.pem")
//         .update(
//             &canister,
//             "method_name"
//         )
//         .with_arg(Encode!().unwrap())
//         .call_and_wait()
//         .await
//         .expect("Call Response Error !");
//     let result = Decode!(&response_blob, CallResultType).unwrap();

//     println!("result : {:?}", result);
// }

#[tokio::main]
async fn main() {
    // local_test::test_store_file().await;
    // local_test::test_create().await;
    // ic_test::test_store_file().await;

    // println!("{}", utils::get_principal(USERA).to_string());

    ic_test::test_store_file().await;
}
