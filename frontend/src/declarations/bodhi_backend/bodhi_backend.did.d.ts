import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Asset {
  'id' : bigint,
  'creator' : Principal,
  'fileKey' : string,
}
export type Error = { 'BurnError' : null } |
  { 'InsufficientPayment' : null } |
  { 'MintError' : null } |
  { 'SupplyNotAllowedBelowPremintAmount' : null } |
  { 'InsufficientBalance' : null } |
  { 'AssetNotExist' : null } |
  { 'TransferCreatorFeeError' : null } |
  { 'Unauthorized' : null } |
  { 'TransferToSellAccountError' : null } |
  { 'AssetNotExistInBucket' : null } |
  { 'AssetAlreadyCreated' : null } |
  { 'TokenOfAssetNotExist' : null } |
  { 'UnknowError' : null } |
  { 'TransferToMainAccountError' : null };
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Principal } |
  { 'err' : Error };
export interface TokenMetaData {
  'creator' : Principal,
  'assetId' : bigint,
  'canisterId' : Principal,
}
export interface bodhi {
  'buy' : ActorMethod<[bigint, bigint], Result>,
  'create' : ActorMethod<[string], Result_1>,
  'getAssetIdToTokenEntries' : ActorMethod<[], Array<[bigint, TokenMetaData]>>,
  'getAssetIdsByPrincipal' : ActorMethod<[Principal], [] | [Array<bigint>]>,
  'getAssetsEntries' : ActorMethod<[], Array<[bigint, Asset]>>,
  'getBuyPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getBuyPriceAfterFee' : ActorMethod<[bigint, bigint], bigint>,
  'getFileKeyToAssetIdEntries' : ActorMethod<[], Array<[string, bigint]>>,
  'getPoolEntries' : ActorMethod<[], Array<[bigint, bigint]>>,
  'getPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getSellPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getSellPriceAfterFee' : ActorMethod<[bigint, bigint], bigint>,
  'getTotalSupplyEntries' : ActorMethod<[], Array<[bigint, bigint]>>,
  'getUserAssetsEntries' : ActorMethod<[], Array<[Principal, Array<bigint>]>>,
  'remove' : ActorMethod<[bigint], Result>,
  'sell' : ActorMethod<[bigint, bigint], Result>,
  'uri' : ActorMethod<[bigint], string>,
}
export interface _SERVICE extends bodhi {}
