import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
export interface bodhi {
  'buy' : ActorMethod<[bigint, bigint], Result>,
  'create' : ActorMethod<[string], Result>,
  'getAssetIdsByPrincipal' : ActorMethod<[Principal], [] | [Array<bigint>]>,
  'getBuyPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getBuyPriceAfterFee' : ActorMethod<[bigint, bigint], bigint>,
  'getPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getSellPrice' : ActorMethod<[bigint, bigint], bigint>,
  'getSellPriceAfterFee' : ActorMethod<[bigint, bigint], bigint>,
  'remove' : ActorMethod<[bigint], Result>,
  'sell' : ActorMethod<[bigint, bigint], Result>,
  'uri' : ActorMethod<[bigint], string>,
}
export interface _SERVICE extends bodhi {}
