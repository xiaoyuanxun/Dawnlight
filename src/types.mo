import Principal "mo:base/Principal";

module {

    public type Asset = {
        id: Nat;
        fileKey: Text;
        creator: Principal;
    };

    public type TradeType = {
        #Mint;
        #Buy;
        #Sell;
    };

    
}