use candid::{CandidType, Deserialize, Principal, Encode, Decode, Nat};

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

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  BadBurn{ min_burn_amount: candid::Nat },
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ICRCTransferResult { 
  Ok(candid::Nat), 
  Err(TransferError) 
}

pub async fn icrc1_transfer(
  icrc_canister: Principal,
  from_agent: ic_agent::Agent,
  to: Principal,
  amount: usize,
  memo: Option<serde_bytes::ByteBuf>,
) -> Result<Nat, TransferError> {
  let response_blob = from_agent
    .update(
      &icrc_canister,
      "icrc1_transfer"
    )
    .with_arg(Encode!(&ICRCTransferArg {
      to: Account {
        owner: to,
        subaccount: None,
      },
      fee: None,
      memo: memo,
      from_subaccount: None,
      created_at_time: None,
      amount: Nat::from(amount)
    }).unwrap())
    .call_and_wait()
    .await
    .expect("icrc1_transfer Response Error !");
  match Decode!(&response_blob, ICRCTransferResult).unwrap() {
    ICRCTransferResult::Ok(block_index) => Ok(block_index),
    ICRCTransferResult::Err(err) => Err(err)
  }
}