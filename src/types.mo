import Principal "mo:base/Principal";
import Time "mo:base/Time";
import BucketTypes "storage/types";
import ICRCTypes "icrc/types";

module {

    public type Asset = {
        id: Nat;
        fileKey: Text;
        fileType: Text;
        creator: Principal;
        tokenCanister: Principal;
        time: Time.Time;
    };

    public type TradeType = {
        #Mint;
        #Buy;
        #Sell;
    };

    public type Error = {
        #AssetNotExistInBucket;
        #AssetAlreadyCreated;
        #AssetNotExist;
        #Unauthorized;
        #InsufficientPayment;
        #InsufficientBalance;
        #TransferToMainAccountError;
        #TransferCreatorFeeError;
        #TransferToSellAccountError;
        #TokenOfAssetNotExist;
        #UnknowError;
        #SupplyNotAllowedBelowPremintAmount;
        #MintError;
        #BurnError;
    };

    public type TokenMetaData = {
        assetId: Nat;
        canisterId: Principal;
        creator: Principal;
    };

    public type BucketActor = BucketTypes.BucketActor;

    public type ICRCActor = ICRCTypes.TokenInterface;

}