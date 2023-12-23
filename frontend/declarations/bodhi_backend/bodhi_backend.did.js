export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'BurnError' : IDL.Null,
    'InsufficientPayment' : IDL.Null,
    'MintError' : IDL.Null,
    'SupplyNotAllowedBelowPremintAmount' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'AssetNotExist' : IDL.Null,
    'TransferCreatorFeeError' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'TransferToSellAccountError' : IDL.Null,
    'AssetNotExistInBucket' : IDL.Null,
    'AssetAlreadyCreated' : IDL.Null,
    'TokenOfAssetNotExist' : IDL.Null,
    'UnknowError' : IDL.Null,
    'TransferToMainAccountError' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : Error });
  const TokenMetaData = IDL.Record({
    'creator' : IDL.Principal,
    'assetId' : IDL.Nat,
    'canisterId' : IDL.Principal,
  });
  const Asset = IDL.Record({
    'id' : IDL.Nat,
    'creator' : IDL.Principal,
    'fileKey' : IDL.Text,
  });
  const bodhi = IDL.Service({
    'buy' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'create' : IDL.Func([IDL.Text], [Result_1], []),
    'getAssetIdToTokenEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, TokenMetaData))],
        ['query'],
      ),
    'getAssetIdsByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Nat))],
        ['query'],
      ),
    'getAssetsEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, Asset))],
        ['query'],
      ),
    'getBuyPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getBuyPriceAfterFee' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getFileKeyToAssetIdEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getPoolEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))],
        ['query'],
      ),
    'getPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getSellPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getSellPriceAfterFee' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getTotalSupplyEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))],
        ['query'],
      ),
    'getUserAssetsEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Nat)))],
        ['query'],
      ),
    'remove' : IDL.Func([IDL.Nat], [Result], []),
    'sell' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'uri' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
  });
  return bodhi;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
