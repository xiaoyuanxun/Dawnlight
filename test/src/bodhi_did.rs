// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Deserialize, Principal, Encode, Decode};

#[derive(CandidType, Deserialize, Debug)]
pub enum Error {
  BurnError,
  InsufficientPayment,
  MintError,
  SupplyNotAllowedBelowPremintAmount,
  InsufficientBalance,
  AssetNotExist,
  TransferCreatorFeeError,
  Unauthorized,
  TransferToSellAccountError,
  AssetNotExistInBucket,
  AssetAlreadyCreated,
  TokenOfAssetNotExist,
  UnknowError,
  TransferToMainAccountError,
}

#[derive(CandidType, Deserialize)]
pub enum Result_ { #[serde(rename="ok")] Ok, #[serde(rename="err")] Err(Error) }

#[derive(CandidType, Deserialize, Debug)]
pub enum CreateResult {
  #[serde(rename="ok")]
  Ok(Principal),
  #[serde(rename="err")]
  Err(Error),
}

#[derive(CandidType, Deserialize)]
pub struct TokenMetaData {
  pub creator: Principal,
  pub assetId: candid::Nat,
  pub canisterId: Principal,
}

// pub struct Service(pub Principal);
// impl Service {
//   pub async fn buy(&self, arg0: candid::Nat, arg1: candid::Nat) -> Result<
//     (Result_,)
//   > { ic_cdk::call(self.0, "buy", (arg0,arg1,)).await }
//   pub async fn create(&self, arg0: String) -> Result<(CreateResult,)> {
//     ic_cdk::call(self.0, "create", (arg0,)).await
//   }
//   pub async fn get_asset_id_to_token_entries(&self) -> Result<
//     (Vec<(candid::Nat,TokenMetaData,)>,)
//   > { ic_cdk::call(self.0, "getAssetIdToTokenEntries", ()).await }
//   pub async fn get_asset_ids_by_principal(&self, arg0: Principal) -> Result<
//     (Option<Vec<candid::Nat>>,)
//   > { ic_cdk::call(self.0, "getAssetIdsByPrincipal", (arg0,)).await }
//   pub async fn get_buy_price(
//     &self,
//     arg0: candid::Nat,
//     arg1: candid::Nat,
//   ) -> Result<(candid::Nat,)> {
//     ic_cdk::call(self.0, "getBuyPrice", (arg0,arg1,)).await
//   }
//   pub async fn get_buy_price_after_fee(
//     &self,
//     arg0: candid::Nat,
//     arg1: candid::Nat,
//   ) -> Result<(candid::Nat,)> {
//     ic_cdk::call(self.0, "getBuyPriceAfterFee", (arg0,arg1,)).await
//   }
//   pub async fn get_price(&self, arg0: candid::Nat, arg1: candid::Nat) -> Result<
//     (candid::Nat,)
//   > { ic_cdk::call(self.0, "getPrice", (arg0,arg1,)).await }
//   pub async fn get_sell_price(
//     &self,
//     arg0: candid::Nat,
//     arg1: candid::Nat,
//   ) -> Result<(candid::Nat,)> {
//     ic_cdk::call(self.0, "getSellPrice", (arg0,arg1,)).await
//   }
//   pub async fn get_sell_price_after_fee(
//     &self,
//     arg0: candid::Nat,
//     arg1: candid::Nat,
//   ) -> Result<(candid::Nat,)> {
//     ic_cdk::call(self.0, "getSellPriceAfterFee", (arg0,arg1,)).await
//   }
//   pub async fn remove(&self, arg0: candid::Nat) -> Result<(Result_,)> {
//     ic_cdk::call(self.0, "remove", (arg0,)).await
//   }
//   pub async fn sell(&self, arg0: candid::Nat, arg1: candid::Nat) -> Result<
//     (Result_,)
//   > { ic_cdk::call(self.0, "sell", (arg0,arg1,)).await }
//   pub async fn uri(&self, arg0: candid::Nat) -> Result<(String,)> {
//     ic_cdk::call(self.0, "uri", (arg0,)).await
//   }
// }

pub const CREATOR_PREMINT: u128 = 1_000_000_000_000_000_000;

pub async fn create(
  canister: Principal,
  agent: ic_agent::Agent,
  file_key: String
) -> Result<Principal, Error> {
  let response_blob = agent
    .update(
      &canister,
      "create"
    )
    .with_arg(Encode!(&file_key).unwrap())
    .call_and_wait()
    .await
    .expect("create Response Error !");
  match Decode!(&response_blob, CreateResult).unwrap() {
    CreateResult::Ok(token_canister) => Ok(token_canister),
    CreateResult::Err(err) => Err(err),
  }
}

// pub async fn get_buy_price_after_fee(
//   canister: Principal,
//   agent: ic_agent::Agent,
//   asset_id: usize,
//   amount: u128
// ) -> Nat {
//   let response_blob = agent
//     .update(
//       &canister,
//       "create"
//     )
//     .with_arg(Encode!(&file_key).unwrap())
//     .call_and_wait()
//     .await
//     .expect("create Response Error !");
//   match Decode!(&response_blob, CreateResult).unwrap() {
//     CreateResult::Ok(token_canister) => Ok(token_canister),
//     CreateResult::Err(err) => Err(err),
//   } 
// }