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
  const Time = IDL.Int;
  const Asset = IDL.Record({
    'id' : IDL.Nat,
    'creator' : IDL.Principal,
    'time' : Time,
    'fileType' : IDL.Text,
    'tokenCanister' : IDL.Principal,
    'fileKey' : IDL.Text,
  });
  const TokenMetaData = IDL.Record({
    'creator' : IDL.Principal,
    'assetId' : IDL.Nat,
    'canisterId' : IDL.Principal,
  });
  const TradeType__1 = IDL.Variant({
    'Buy' : IDL.Null,
    'Mint' : IDL.Null,
    'Sell' : IDL.Null,
  });
  const TradeMetaData = IDL.Record({
    'tradeType' : TradeType__1,
    'assetId' : IDL.Nat,
    'user' : IDL.Principal,
    'tokenAmount' : IDL.Nat,
    'icpAmount' : IDL.Nat,
  });
  const TradeType = IDL.Variant({
    'Buy' : IDL.Null,
    'Mint' : IDL.Null,
    'Sell' : IDL.Null,
  });
  const Dawnlight = IDL.Service({
    'buy' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'create' : IDL.Func([IDL.Text], [Result_1], []),
    'getAsset' : IDL.Func([IDL.Nat], [IDL.Opt(Asset)], ['query']),
    'getAssetIdToToken' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
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
    'getCREATOR_FEE_PERCENT' : IDL.Func([], [IDL.Nat], ['query']),
    'getCREATOR_PREMINT' : IDL.Func([], [IDL.Nat], ['query']),
    'getFileKeyToAssetIdEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getHolders' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'getPoolEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))],
        ['query'],
      ),
    'getPoolValue' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'getPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getRecentTrade' : IDL.Func([IDL.Nat], [IDL.Vec(TradeMetaData)], ['query']),
    'getSellPrice' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getSellPriceAfterFee' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ['query']),
    'getShareSupply' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'getTokenCanisterByAssetId' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'getTotalSupplyEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))],
        ['query'],
      ),
    'getTradeEventEntries' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              TradeType,
              IDL.Nat,
              IDL.Principal,
              IDL.Nat,
              IDL.Nat,
              IDL.Nat,
            )
          ),
        ],
        ['query'],
      ),
    'getUserAssetsEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Nat)))],
        ['query'],
      ),
    'getUserBuyed' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(Asset, IDL.Nat))],
        ['query'],
      ),
    'getUserBuyedAssetsEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(Asset, IDL.Nat))))],
        ['query'],
      ),
    'getUserCreated' : IDL.Func([IDL.Principal], [IDL.Vec(Asset)], ['query']),
    'getWicp' : IDL.Func([IDL.Principal], [Result], []),
    'remove' : IDL.Func([IDL.Nat], [Result], []),
    'sell' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'uri' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
  });
  return Dawnlight;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
