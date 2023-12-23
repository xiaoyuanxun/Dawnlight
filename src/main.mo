import TrieMap "mo:base/TrieMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Types "types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Token "icrc/token";
import Buffer "mo:base/Buffer";

actor class bodhi(
  _bucketCanisterId: Principal,
  _wicpCanisterId: Principal
) = this {

  type Asset = Types.Asset;
  type TradeType = Types.TradeType;
  type BucketActor = Types.BucketActor;
  type Error = Types.Error;
  type TokenMetaData = Types.TokenMetaData;
  type ICRCActor = Types.ICRCActor;

  stable var bucketCanisterId = _bucketCanisterId;
  stable var wicpCanisterId = _wicpCanisterId;
  stable var assetIndex: Nat = 0;
  
  stable var CreateEvent: [(Nat, Principal, Text)] = []; // (assetId, sender, fileKey)
  stable var RemoveEvent: [(Nat, Principal)] = []; // (assetId, sender)
  stable var TradeEvent: [(
    TradeType, Nat, Principal, Nat, Nat, Nat
  )] = []; // (tradeType, assetId, sender, tokenAmount, wicpAmount, creatorFee);

  stable var assets_entries: [(Nat, Asset)] = [];
  let assets = TrieMap.fromEntries<Nat, Asset>(assets_entries.vals(), Nat.equal, Hash.hash);

  stable var userAssets_entries: [(Principal, [Nat])] = [];
  let userAssets = TrieMap.fromEntries<Principal, [Nat]>(userAssets_entries.vals(), Principal.equal, Principal.hash);

  stable var fileKeyToAssetId_entries: [(Text, Nat)] = [];
  let fileKeyToAssetId = TrieMap.fromEntries<Text, Nat>(fileKeyToAssetId_entries.vals(), Text.equal, Text.hash);

  stable var totalSupply_entries: [(Nat, Nat)] = [];
  let totalSupply = TrieMap.fromEntries<Nat, Nat>(totalSupply_entries.vals(), Nat.equal, Hash.hash);

  stable var pool_entries: [(Nat, Nat)] = [];
  let pool = TrieMap.fromEntries<Nat, Nat>(pool_entries.vals(), Nat.equal, Hash.hash);

  stable var assetIdToToken_entries: [(Nat, TokenMetaData)] = [];
  let assetIdToToken = TrieMap.fromEntries<Nat, TokenMetaData>(assetIdToToken_entries.vals(), Nat.equal, Hash.hash);

  stable let CREATOR_PREMINT = 1_000_000_000_000_000_000; // 1e18
  stable let CREATOR_FEE_PERCENT = 50_000_000_000_000_000; // 5%
  stable let T_CYCLES = 1_000_000_000_000; // 1e12 = 1 T Cycles
  stable let TOKEN_FEE = 10_000;

  system func preupgrade() {
    assets_entries := Iter.toArray(assets.entries());
    userAssets_entries := Iter.toArray(userAssets.entries());
    fileKeyToAssetId_entries := Iter.toArray(fileKeyToAssetId.entries());
    totalSupply_entries := Iter.toArray(totalSupply.entries());
    pool_entries := Iter.toArray(pool.entries());
    assetIdToToken_entries := Iter.toArray(assetIdToToken.entries());
  };

  system func postupgrade() {
    assets_entries := [];
    userAssets_entries := [];
    fileKeyToAssetId_entries := [];
    totalSupply_entries := [];
    pool_entries := [];
    assetIdToToken_entries := [];
  };

  public query func getAssetsEntries(): async [(Nat, Asset)] {
    Iter.toArray(assets.entries())
  };

  public query func getUserAssetsEntries(): async [(Principal, [Nat])] {
    Iter.toArray(userAssets.entries())
  };

  public query func getFileKeyToAssetIdEntries(): async [(Text, Nat)] {
    Iter.toArray(fileKeyToAssetId.entries())
  };

  public query func getTotalSupplyEntries(): async [(Nat, Nat)] {
    Iter.toArray(totalSupply.entries())
  };

  public query func getPoolEntries(): async [(Nat, Nat)] {
    Iter.toArray(pool.entries())
  };

  public query func getAssetIdToTokenEntries(): async [(Nat, TokenMetaData)] {
    Iter.toArray(assetIdToToken.entries())
  };

  public shared({caller}) func create(fileKey: Text): async Result.Result<Principal, Error> {
    // 查询 Bucket 资产是否存在
    let bucket: BucketActor = actor(Principal.toText(bucketCanisterId));
    switch((await bucket.getFileAsset(fileKey))) {
      case(null) return #err(#AssetNotExistInBucket);
      case(?_asset) {
        switch(fileKeyToAssetId.get(fileKey)) {
          case(?_fileKey) return #err(#AssetAlreadyCreated);
          case(null) {
            let newAssetId = assetIndex;
            Cycles.add(T_CYCLES);
            let token = await Token.Token({
              name = "bodhi_ic_" # Nat.toText(newAssetId);
              symbol = "bodhi_ic_" # Nat.toText(newAssetId);
              decimals = 8;
              fee = TOKEN_FEE;
              max_supply = CREATOR_PREMINT;
              initial_balances = [({
                owner = caller;
                subaccount = null;
              },CREATOR_PREMINT)];
              min_burn_amount = TOKEN_FEE;
              minting_account = null;
              advanced_settings = null;
            });
            assets.put(newAssetId, {
              id = newAssetId;
              fileKey = fileKey;
              creator = caller;
            });
            switch(userAssets.get(caller)) {
              case(null) {
                userAssets.put(caller, [newAssetId]);
              };
              case(?_assetsArray) {
                userAssets.put(caller, Array.append(_assetsArray, [newAssetId]));
              };
            };
            fileKeyToAssetId.put(fileKey, newAssetId);
            totalSupply.put(newAssetId, CREATOR_PREMINT);
            assetIndex += 1;

            assetIdToToken.put(newAssetId, {
              assetId = newAssetId;
              canisterId = Principal.fromActor(token);
              creator = caller;
            });
            CreateEvent := Array.append(CreateEvent, [(newAssetId, caller, fileKey)]);
            TradeEvent := Array.append(TradeEvent, [(#Mint, newAssetId, caller, CREATOR_PREMINT, 0, 0)]);
            #ok(Principal.fromActor(token))
          };
        };
      };
    };
  };

  public shared({caller}) func remove(assetId: Nat): async Result.Result<(), Error> {
    switch(assets.get(assetId)) {
      case(null) return #err(#AssetNotExist);
      case(?_asset) {
        if(_asset.creator != caller) return #err(#Unauthorized);
        fileKeyToAssetId.delete(_asset.fileKey);
        assets.delete(assetId);
        RemoveEvent := Array.append(RemoveEvent, [(assetId, caller)]);
        #ok(())
      };
    };
  };

  public query func getAssetIdsByPrincipal(
    principal: Principal
  ): async ?[Nat] {
    userAssets.get(principal)
  };

  private func _curve(x: Nat): Nat {
    if(x <= CREATOR_PREMINT) return 0;
    (x - CREATOR_PREMINT) * (x - CREATOR_PREMINT) * (x - CREATOR_PREMINT)
  };

  public query func getPrice(supply: Nat, amount: Nat): async Nat {
    _getPrice(supply, amount)
  };

  private func _getPrice(supply: Nat, amount: Nat): Nat {
    (_curve(supply + amount) - _curve(supply)) / CREATOR_PREMINT / CREATOR_PREMINT / 50_000;
  };

  public query func getBuyPrice(assetId: Nat, amount: Nat): async Nat {
    _getBuyPrice(assetId, amount)
  };

  private func _getBuyPrice(assetId: Nat, amount: Nat): Nat {
    _getPrice(
      switch(totalSupply.get(assetId)) {
        case(null) 0;
        case(?_supply) _supply;
      }, amount)
  };

  public query func getSellPrice(assetId: Nat, amount: Nat): async Nat {
    _getSellPrice(assetId, amount)
  };

  private func _getSellPrice(assetId: Nat, amount: Nat): Nat {
    switch(totalSupply.get(assetId)) {
      case(null) {
        _getPrice(0 - amount, amount)
      };
      case(?_supply) {
        _getPrice(_supply - amount, amount)
      };
    }
  };

  public query func getBuyPriceAfterFee(assetId: Nat, amount: Nat): async Nat {
    let price = _getBuyPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    price + creatorFee
  };

  public query func getSellPriceAfterFee(assetId: Nat, amount: Nat): async Nat {
    let price = _getSellPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    price - creatorFee
  };

  public shared({caller}) func buy(
    assetId: Nat,
    amount: Nat
  ): async Result.Result<(), Error> {
    if(assetId >= assetIndex) return #err(#AssetNotExist);
    let price = _getBuyPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    let wicp: ICRCActor = actor(Principal.toText(wicpCanisterId));

    // 检查用户给子账户付款是否充足
    let transferedAmount = await wicp.icrc1_balance_of({
      owner = Principal.fromActor(this);
      subaccount = ?Principal.toBlob(caller);
    });    
    if(transferedAmount < price + creatorFee) return #err(#InsufficientPayment);
    
    // 转走给主账号
    switch((await wicp.icrc1_transfer({
      from_subaccount = ?Principal.toBlob(caller);
      to = {
        owner = Principal.fromActor(this);
        subaccount = null;
      };
      amount = price + creatorFee;
      fee = null;
      memo = null;
      created_at_time = null;
    }))) {
      case(#Err(_)) return #err(#TransferToMainAccountError);
      case(#Ok(_)) {
      };
    };

    switch(totalSupply.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_supply) {
        totalSupply.put(assetId, _supply + amount);
      };
    };

    switch(pool.get(assetId)) {
      case(null) {
        pool.put(assetId, price);
      };
      case(?_poolPrice) {
        pool.put(assetId, _poolPrice + price);
      };
    };

    switch(assetIdToToken.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_tokenMetaData) {
        let token: ICRCActor = actor(Principal.toText(_tokenMetaData.canisterId));
        switch((await token.mint({
          to = {
            owner = caller;
            subaccount = null;
          };
          amount = amount;
          memo = null;
          created_at_time = null;
        }))) {
          case(#Err(_)) return #err(#MintError);
          case(#Ok(_)) { }
        };
      };
    };

    TradeEvent := Array.append(TradeEvent, [(#Buy, assetId, caller, amount, price, creatorFee)]);

    switch(assets.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_asset) {
        // 转创作者
        switch((await wicp.icrc1_transfer({
          from_subaccount = null;
          to = {
            owner = _asset.creator;
            subaccount = null;
          };
          amount = creatorFee;
          fee = null;
          memo = null;
          created_at_time = null;
        }))) {
          case(#Err(_)) return #err(#TransferCreatorFeeError);
          case(#Ok(_)) { };
        };
      }
    };

    #ok(())
  };

  public shared({caller}) func sell(
    assetId: Nat,
    amount: Nat
  ): async Result.Result<(), Error> {
    if(assetId >= assetIndex) return #err(#AssetNotExist);
    switch(assetIdToToken.get(assetId)) {
      case(null) return #err(#TokenOfAssetNotExist);
      case(?_tokenMetaData) {
        let token: ICRCActor = actor(Principal.toText(_tokenMetaData.canisterId));
        let burnTokenBalance = await token.icrc1_balance_of({
          owner = Principal.fromActor(this);
          subaccount = ?Principal.toBlob(caller);
        });
        if(burnTokenBalance < amount) return #err(#InsufficientBalance);

        switch(totalSupply.get(assetId)) {
          case(null) return #err(#UnknowError);
          case(?_supply) {
            if(_supply - amount < CREATOR_PREMINT) return #err(#SupplyNotAllowedBelowPremintAmount);


            // burn
            switch((await token.burn({
              from_subaccount = ?Principal.toBlob(caller);
              amount = amount;
              memo = null;
              created_at_time = null;
            }))) {
              case(#Err(_)) return #err(#BurnError);
              case(#Ok(_)) { };
            };

            totalSupply.put(assetId, _supply - amount);
          };
        };
      };
    };

    let price = _getSellPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;

    switch(pool.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_poolPrice) {
        pool.put(assetId, _poolPrice - price);
      };
    };

    TradeEvent := Array.append(TradeEvent, [(#Buy, assetId, caller, amount, price, creatorFee)]);

    let wicp: ICRCActor = actor(Principal.toText(wicpCanisterId));

    // 转给售出者
    switch((await wicp.icrc1_transfer({
      from_subaccount = null;
      to = {
        owner = caller;
        subaccount = null;
      };
      amount = price - creatorFee;
      fee = null;
      memo = null;
      created_at_time = null;
    }))) {
      case(#Err(_)) return #err(#TransferToSellAccountError);
      case(#Ok(_)) {
      };
    };

    switch(assets.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_asset) {
        // 转创作者
        switch((await wicp.icrc1_transfer({
          from_subaccount = null;
          to = {
            owner = _asset.creator;
            subaccount = null;
          };
          amount = creatorFee;
          fee = null;
          memo = null;
          created_at_time = null;
        }))) {
          case(#Err(_)) return #err(#TransferCreatorFeeError);
          case(#Ok(_)) { };
        };
      }
    };

    #ok(())
  };

  // https://canisterId.icp0.io/filekey
  public query func uri(id: Nat): async Text {
    switch(assets.get(id)) {
      case(null) return "https://" # Principal.toText(bucketCanisterId) #".icp0.io";
      case(?_asset) {
        "https://" # Principal.toText(bucketCanisterId) #".icp0.io/" # _asset.fileKey
      }
    }
  }

};
