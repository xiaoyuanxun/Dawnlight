use candid::{CandidType, Deserialize, Principal, Encode, Decode};

#[derive(CandidType, Deserialize, Debug)]
pub struct Account {
  pub owner: Principal,
  pub subaccount: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ICRCTransferArg {
  pub to: Account,
  pub fee: Option<candid::Nat>,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub from_subaccount: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ApproveArgs {
  pub fee: Option<candid::Nat>,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub from_subaccount: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
  pub expected_allowance: Option<candid::Nat>,
  pub expires_at: Option<u64>,
  pub spender: Account,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct AllowanceArgs {
    pub account: Account, 
    pub spender: Account 
}

#[derive(CandidType, Deserialize, Debug)]
pub struct TransferFromArgs {
  pub to: Account,
  pub fee: Option<candid::Nat>,
  pub spender_subaccount: Option<serde_bytes::ByteBuf>,
  pub from: Account,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
}