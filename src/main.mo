import TrieMap "mo:base/TrieMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Types "types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor class bodhi() = this {

  type Asset = Types.Asset;
  type TradeType = Types.TradeType;

  stable var assetIndex: Nat = 0;
  
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

  stable let CREATOR_PREMINT = 100_000_000; // 1 ICP
  stable let CREATOR_FEE_PERCENT = 5_000_000; // 5%

  system func preupgrade() {
    assets_entries := Iter.toArray(assets.entries());
    userAssets_entries := Iter.toArray(userAssets.entries());
    fileKeyToAssetId_entries := Iter.toArray(fileKeyToAssetId.entries());
    totalSupply_entries := Iter.toArray(totalSupply.entries());
    pool_entries := Iter.toArray(pool.entries());
  };

  system func postupgrade() {
    assets_entries := [];
    userAssets_entries := [];
    fileKeyToAssetId_entries := [];
    totalSupply_entries := [];
    pool_entries := [];
  };

  public shared({caller}) func create(fileKey: Text): async () {

  };

  public shared({caller}) func remove(assetId: Nat): async () {

  };

  public query({caller}) func getAssetIdsByPrincipal(
    principal: Principal
  ): async ?Nat {
    null
  };

  public shared({caller}) func buy(
    assetId: Nat,
    amount: Nat
  ): async () {

  };

  public shared({caller}) func sell(
    assetId: Nat,
    amount: Nat
  ): async () {

  };  

};
