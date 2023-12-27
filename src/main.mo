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
import Time "mo:base/Time";
import Order "mo:base/Order";
import {ic} "mo:ic";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Debug "mo:base/Debug";

actor class Dawnlight(
  _bucketCanisterId: Principal,
  _wicpCanisterId: Principal
) = this {

  type Asset = Types.Asset;
  type TradeType = Types.TradeType;
  type BucketActor = Types.BucketActor;
  type Error = Types.Error;
  type TokenMetaData = Types.TokenMetaData;
  type ICRCActor = Types.ICRCActor;
  type TradeMetaData = Types.TradeMetaData;

  stable var bucketCanisterId = _bucketCanisterId;
  stable var wicpCanisterId = _wicpCanisterId;
  stable var ASSET_INDEX: Nat = 0;
  
  stable var CreateEvent: [(Nat, Principal, Text)] = []; // (assetId, sender, fileKey)
  stable var RemoveEvent: [(Nat, Principal)] = []; // (assetId, sender)
  stable var TradeEvent: [(
    TradeType, Nat, Principal, Nat, Nat, Nat
  )] = []; // (tradeType, assetId, sender, tokenAmount, wicpAmount, creatorFee);

  stable var assets_entries: [(Nat, Asset)] = [];
  let assets = TrieMap.fromEntries<Nat, Asset>(assets_entries.vals(), Nat.equal, Hash.hash);

  stable var userAssets_entries: [(Principal, [Nat])] = [];
  let userAssets = TrieMap.fromEntries<Principal, [Nat]>(userAssets_entries.vals(), Principal.equal, Principal.hash);

  stable var userBuyedAssets_entries: [(Principal, [(Asset, Nat)])] = [];
  let userBuyedAssets = TrieMap.fromEntries<Principal, [(Asset, Nat)]>(userBuyedAssets_entries.vals(), Principal.equal, Principal.hash);

  stable var fileKeyToAssetId_entries: [(Text, Nat)] = [];
  let fileKeyToAssetId = TrieMap.fromEntries<Text, Nat>(fileKeyToAssetId_entries.vals(), Text.equal, Text.hash);

  stable var totalSupply_entries: [(Nat, Nat)] = [];
  let totalSupply = TrieMap.fromEntries<Nat, Nat>(totalSupply_entries.vals(), Nat.equal, Hash.hash);

  stable var pool_entries: [(Nat, Nat)] = [];
  let pool = TrieMap.fromEntries<Nat, Nat>(pool_entries.vals(), Nat.equal, Hash.hash);

  stable var assetIdToToken_entries: [(Nat, TokenMetaData)] = [];
  let assetIdToToken = TrieMap.fromEntries<Nat, TokenMetaData>(assetIdToToken_entries.vals(), Nat.equal, Hash.hash);

  stable var CREATOR_PREMINT: Nat = 100_000_000; // 1e8
  stable let MAX_SUPPLY: Nat = 100_000_000_000 * CREATOR_PREMINT; // 1k 亿 
  stable var CREATOR_FEE_PERCENT: Nat = 5_000_000; // 5%
  stable let DECIMALS: Nat = 100_000_000; // 1e8
  stable let T_CYCLES: Nat = 1_000_000_000_000; // 1e12 = 1 T Cycles
  stable let TOKEN_FEE: Nat = 10_000;

  system func preupgrade() {
    assets_entries := Iter.toArray(assets.entries());
    userAssets_entries := Iter.toArray(userAssets.entries());
    fileKeyToAssetId_entries := Iter.toArray(fileKeyToAssetId.entries());
    totalSupply_entries := Iter.toArray(totalSupply.entries());
    pool_entries := Iter.toArray(pool.entries());
    assetIdToToken_entries := Iter.toArray(assetIdToToken.entries());
    userBuyedAssets_entries := Iter.toArray(userBuyedAssets.entries());
  };

  system func postupgrade() {
    assets_entries := [];
    userAssets_entries := [];
    fileKeyToAssetId_entries := [];
    totalSupply_entries := [];
    pool_entries := [];
    assetIdToToken_entries := [];
    userBuyedAssets_entries := [];
  };

  public query func getAssetIdToToken(assetId: Nat): async ?Principal {
    switch(assetIdToToken.get(assetId)) {
      case(null) null;
      case(?_tokenMetaData) ?_tokenMetaData.canisterId;
    }
  };

  public query func getTradeEventEntries(): async [(
    TradeType, Nat, Principal, Nat, Nat, Nat
  )] {
    TradeEvent
  };

  public query func getPoolValue(assetId: Nat): async Nat {
    switch(pool.get(assetId)) {
      case(null) 0;
      case(?_poolValue) _poolValue;
    }
  };

  public query func getRecentTrade(assetId: Nat): async [TradeMetaData] {
    let tradeBuffer = Buffer.Buffer<TradeMetaData>(TradeEvent.size());
    for(_trade in Array.reverse(TradeEvent).vals()) {
      if(_trade.1 == assetId) {
        tradeBuffer.add({
          tradeType = _trade.0;
          assetId = _trade.1;
          user = _trade.2;
          tokenAmount = _trade.3;
          icpAmount = _trade.4;
        })
      }
    };
    Buffer.toArray<TradeMetaData>(tradeBuffer)
  };

  public query func getHolders(assetId: Nat): async [(Principal, Nat)] {
    let holdersBuffer = Buffer.Buffer<(Principal, Nat)>(userBuyedAssets.size());
    for((_k, _v) in userBuyedAssets.entries()) {
      for((_asset, _amount) in _v.vals()) {
        if(_asset.id == assetId) {
          holdersBuffer.add(_k, _amount)
        };
      }
    };
    // 添加作者本人

    Buffer.toArray<(Principal, Nat)>(holdersBuffer)
  };

  public query func getShareSupply(assetId: Nat): async Nat {
    switch(totalSupply.get(assetId)) {
      case(null) 0;
      case(?_supply) _supply;
    }
  };

  public query func getCREATOR_PREMINT(): async Nat { CREATOR_PREMINT };

  public query func getCREATOR_FEE_PERCENT(): async Nat { CREATOR_FEE_PERCENT };

  public query func getAssetsEntries(): async [(Nat, Asset)] {
    Iter.toArray(
      Iter.sort<(Nat, Asset)>(
        assets.entries(),
        func (x: (Nat, Asset), y: (Nat, Asset)): Order.Order {
          Nat.compare(x.0, y.0)
        }
      )
    )
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

  public query func getUserBuyedAssetsEntries(): async [(Principal, [(Asset, Nat)])] {
      Iter.toArray(userBuyedAssets.entries())
  };

  public query func getAsset(assetId: Nat): async ?Asset {
    switch(assets.get(assetId)) {
      case(null) null;
      case(_asset) _asset;
    }
  };

  public query func getTokenCanisterByAssetId(assetId: Nat): async ?Principal {
    switch(assetIdToToken.get(assetId)) {
      case(null) null;
      case(?_token) ?_token.canisterId;
    }
  };

  public query func getUserCreated(user: Principal): async [Asset] {
    Iter.toArray<Asset>(
      Iter.sort<Asset>(
        Iter.filter<Asset>(
          assets.vals(),
          func (x: Asset): Bool {
              x.creator == user
          } 
        ),
        func (x: Asset, y: Asset): Order.Order {
            if(x.time > y.time) #less
            else if(x.time == y.time) #equal
            else #greater
        }  
      )
    )
  };

  // return [(Asset, amount)]
  // 用户买的资产 
  public query func getUserBuyed(user: Principal): async [(Asset, Nat)] {
    switch(userBuyedAssets.get(user)) {
      case(null) [];
      case(?_buyedAssetArray) _buyedAssetArray
    }
  };

  // 水龙头
  public shared func getWicp(user: Principal): async Result.Result<(), Error> {
    let wicp: ICRCActor = actor(Principal.toText(wicpCanisterId));
    switch((await wicp.icrc1_transfer({
      from_subaccount = null;
      to = {
        owner = user;
        subaccount = null;
      };
      amount = 100 * DECIMALS;
      fee = null;
      memo = null;
      created_at_time = null;
    }))) {
      case(#Err(_)) return #err(#TransferToMainAccountError);
      case(#Ok(_)) #ok(())
    };
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
            let newAssetId = ASSET_INDEX;

            Cycles.add(T_CYCLES);
            let token = await Token.Token({
              name = "bodhi_ic_" # Nat.toText(newAssetId);
              symbol = "bodhi_ic_" # Nat.toText(newAssetId);
              decimals = 8;
              fee = TOKEN_FEE;
              max_supply = MAX_SUPPLY;
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
              fileType = _asset.file_type;
              creator = caller;
              tokenCanister = Principal.fromActor(token);
              time = Time.now();
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
            ASSET_INDEX += 1;

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
    (_curve(supply + amount) - _curve(supply)) / CREATOR_PREMINT / CREATOR_PREMINT / 50; // PM / k, k = 50_000
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
        if((_supply + DECIMALS)<= amount) return _getPrice(DECIMALS, _supply);
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

  // Convert principal id to subaccount id.
  // sub account = [sun_account_id_size, principal_blob, 0,0,···]
  private func _principalToSubAccount(id: Principal) : Blob {
      let p = Blob.toArray(Principal.toBlob(id));
      let subAccount = Array.tabulate(32, func(i : Nat) : Nat8 {
          if (i >= p.size() + 1) 0 
          else if (i == 0) (Nat8.fromNat(p.size()))
          else (p[i - 1])
      });
      Blob.fromArray(subAccount)
  };

  // getBuyPriceAfterFee 查询付的钱
  // 调wicp 转 bodhi_caniser, subAccount(Principal.toBlob(caller))
  // amount 0.01 share = 0.01 * 1e18
  public shared({caller}) func buy(
    assetId: Nat,
    amount: Nat
  ): async Result.Result<(), Error> {
    if(assetId >= ASSET_INDEX) return #err(#AssetNotExist);
    let price = _getBuyPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    let wicp: ICRCActor = actor(Principal.toText(wicpCanisterId));

    // 检查用户给子账户付款是否充足
    let transferedAmount = await wicp.icrc1_balance_of({
      owner = Principal.fromActor(this);
      subaccount = ?_principalToSubAccount(caller)
    });    
    if(transferedAmount < price + creatorFee) return #err(#InsufficientPayment);
    
    // 转走给主账号
    switch((await wicp.icrc1_transfer({
      from_subaccount = ?_principalToSubAccount(caller);
      to = {
        owner = Principal.fromActor(this);
        subaccount = null;
      };
      amount = price + creatorFee - TOKEN_FEE;
      fee = null;
      memo = null;
      created_at_time = null;
    }))) {
      case(#Err(_)) return #err(#TransferToMainAccountError);
      case(#Ok(_)) {
      };
    };

    // Mint Token
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

    TradeEvent := Array.append(TradeEvent, [(#Buy, assetId, caller, amount, price, creatorFee)]);

    // 支付创作者费用
    switch(assets.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_asset) {
        switch((await wicp.icrc1_transfer({
          from_subaccount = null;
          to = {
            owner = _asset.creator;
            subaccount = null;
          };
          amount = creatorFee - TOKEN_FEE;
          fee = null;
          memo = null;
          created_at_time = null;
        }))) {
          case(#Err(_)) return #err(#TransferCreatorFeeError);
          case(#Ok(_)) { };
        };
      }
    };

    _putBuyed(caller, assetId, amount);

    #ok(())
  };

  private func _putBuyed(user: Principal, assetId: Nat, amount: Nat) {
    switch(assets.get(assetId)) {
      case(null) return;
      case(?_asset) {
        switch(userBuyedAssets.get(user)) {
          case(null) {
            userBuyedAssets.put(user, [(_asset, amount)]);
          };
          case(?_buyedAssetArray) {
            switch(Array.find<(Asset, Nat)>(
              _buyedAssetArray,
              func (x: (Asset, Nat)): Bool {
                x.0.id == assetId
              }
            )) {
              case(null) {
                userBuyedAssets.put(user, Array.append(_buyedAssetArray, [(_asset, amount)]))
              };
              case(?_oldAmount) {
                let newUserBuyedAssetArray = 
                  Array.map<(Asset, Nat), (Asset, Nat)>(
                    _buyedAssetArray,
                    func (x: (Asset, Nat)): (Asset, Nat) {
                      if(x.0.id == assetId) (x.0, x.1 + amount)
                      else (x.0, x.1)
                    }
                  );
                userBuyedAssets.put(user, newUserBuyedAssetArray);
              };
            };
          };
        };
      };
    };
  };

  // 考虑 icrc token 直接转移的情况
  private func _removeBuyed(user: Principal, assetId: Nat, amount: Nat): Bool {
    switch(userBuyedAssets.get(user)) {
      case(null) false;
      case(?_buyedAssetArray) {
        switch(Array.find<(Asset, Nat)>(
          _buyedAssetArray,
          func (x: (Asset, Nat)): Bool {
            x.0.id == assetId
          }
        )) {
          case(null) false;
          case(?_oldAmount) {
            let newUserBuyedAssetArray = 
              Array.map<(Asset, Nat), (Asset, Nat)>(
                _buyedAssetArray,
                func (x: (Asset, Nat)): (Asset, Nat) {
                  if(x.0.id == assetId) (x.0, x.1 - amount)
                  else (x.0, x.1)
                }
              );
            userBuyedAssets.put(user, newUserBuyedAssetArray);
            true
          };
        };
      }
    }
  };

  // 得先获取 token 的 canister_id getTokenCanisterByAssetId
  // getSellPriceAfterFee 获取 token 要转的amount
  // 调token canister 转给 bodhi_caniser, sub(Principal.toBlob(caller))
  // amount * 1e8
  public shared({caller}) func sell(
    assetId: Nat,
    amount: Nat
  ): async Result.Result<(), Error> {
    if(assetId >= ASSET_INDEX) return #err(#AssetNotExist);
    let price = _getSellPrice(assetId, amount);
    let creatorFee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    switch(assetIdToToken.get(assetId)) {
      case(null) return #err(#TokenOfAssetNotExist);
      case(?_tokenMetaData) {
        let token: ICRCActor = actor(Principal.toText(_tokenMetaData.canisterId));
        let burnTokenBalance = await token.icrc1_balance_of({
          owner = Principal.fromActor(this);
          subaccount = ?_principalToSubAccount(caller);
        });
        if(burnTokenBalance < amount) return #err(#InsufficientBalance);

        switch(totalSupply.get(assetId)) {
          case(null) return #err(#UnknowError);
          case(?_supply) {
            if(_supply - amount < CREATOR_PREMINT) return #err(#SupplyNotAllowedBelowPremintAmount);

            // burn
            switch((await token.burn({
              from_subaccount = ?_principalToSubAccount(caller);
              amount = amount - TOKEN_FEE;
              memo = null;
              created_at_time = null;
            }))) {
              case(#Err(_)) return #err(#BurnError);
              case(#Ok(_)) { };
            };

            ignore _removeBuyed(caller, assetId, amount);

            totalSupply.put(assetId, _supply - amount);
          };
        };
      };
    };

    switch(pool.get(assetId)) {
      case(null) return #err(#UnknowError);
      case(?_poolPrice) {
        pool.put(assetId, _poolPrice - price);
      };
    };

    TradeEvent := Array.append(TradeEvent, [(#Sell, assetId, caller, amount, price, creatorFee)]);

    let wicp: ICRCActor = actor(Principal.toText(wicpCanisterId));

    // 转给售出者
    switch((await wicp.icrc1_transfer({
      from_subaccount = null;
      to = {
        owner = caller;
        subaccount = null;
      };
      amount = price - creatorFee - TOKEN_FEE;
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
          amount = creatorFee - TOKEN_FEE;
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

  // https://canisterId.raw.icp0.io/filekey
  public query func uri(id: Nat): async Text {
    switch(assets.get(id)) {
      case(null) return "https://" # Principal.toText(bucketCanisterId) #".icp0.io";
      case(?_asset) {
        "https://" # Principal.toText(bucketCanisterId) #".raw.icp0.io/" # _asset.fileKey
      }
    }
  }

};
