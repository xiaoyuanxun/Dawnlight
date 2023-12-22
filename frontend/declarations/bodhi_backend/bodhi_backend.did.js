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
  const bodhi = IDL.Service({
    'buy' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'create' : IDL.Func([IDL.Text], [Result], []),
    'getAssetIdsByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Nat))],
        ['query'],
      ),
    'getBuyPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getBuyPriceAfterFee' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getSellPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getSellPriceAfterFee' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'remove' : IDL.Func([IDL.Nat], [Result], []),
    'sell' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'uri' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
  });
  return bodhi;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
