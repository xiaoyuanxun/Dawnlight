use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use serde_bytes;

#[derive(CandidType, Deserialize, Debug)]
pub struct StoreArgs {
  pub key: String,
  pub value: serde_bytes::ByteBuf,
  pub total_index: candid::Nat,
  pub file_type: String,
  pub total_size: u64,
  pub index: candid::Nat,
}