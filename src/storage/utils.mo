import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Hash "mo:base/Hash";
import Nat64 "mo:base/Nat64";
import Prim "mo:⛔";
import Order "mo:base/Order";

module Utils{

    public type Token = { e8s : Nat64 };

    public type FileBufExt = {
        total_index : Nat;
        wrote_page : [Bool];
        received : Nat;
        bucket_id : Principal;
        file_type: Text;
        total_size: Nat64;
        is_http_open: Bool;
    };

    // Convert principal id to subaccount id.
    // sub account = [sun_account_id_size, principal_blob, 0,0,···]
    public func principalToSubAccount(id: Principal) : [Nat8] {
        let p = Blob.toArray(Principal.toBlob(id));
        Array.tabulate(32, func(i : Nat) : Nat8 {
            if (i >= p.size() + 1) 0
            else if (i == 0) (Nat8.fromNat(p.size()))
            else (p[i - 1])
        })
    };

    // size降序方法
    public func compareSizeDescend(x : (Nat64,  Nat64), y : (Nat64,  Nat64)) : Order.Order {
        if (x.1 > y.1) { #less }
        else if (x.1 == y.1) { #equal }
        else { #greater }
    };
        
    // nat对的hash方法
    public func pairHash(t : (Nat64,  Nat64)) : Hash.Hash {
        let t1 : Text = Nat64.toText(t.0);
        let t2 : Text = Nat64.toText(t.1);
        let txt : Text = t1 # "-" # t2;
        var x : Nat32 = 5381;
        for (char in txt.chars()) {
            let c : Nat32 = Prim.charToNat32(char);
            x := ((x << 5) +% x) +% c;
        };
        return x
    };

    // 对碎片数组进行遍历查找最大碎片
    public func maxNatArray(arr : [(Nat64, Nat64)]) : (Nat64, Nat64) {
        var res : (Nat64, Nat64) = (0, 0);
        for ((start, size) in arr.vals()) {
            if (size > res.1) {
                res := (start, size);
            };
        };
        res
    };
    
    // start升序方法
    public func compareStart(x : (Nat64,  Nat64), y : (Nat64,  Nat64)) : Order.Order {
        if (x.0 < y.0) { #less }
        else if (x.0 == y.0) { #equal }
        else { #greater }
    };

    // nat对的equal方法
    public func pairEqual(t1 : (Nat64,  Nat64), t2 : (Nat64,  Nat64)) : Bool { 
        if (t1.0 == t2.0 and t1.1 == t2.1) {
            return true;
        } else {
            return false;
        };
    };

    public func appendFileBufExt(
        buffer : [var FileBufExt], 
        arr : [var FileBufExt]
    ) : [var FileBufExt]{
        switch(buffer.size(), arr.size()) {
            case (0, 0) { [var] };
            case (0, _) { arr };
            case (_, 0) { buffer };
            case (xsSize, ysSize) {
                let x : FileBufExt = {
                    total_index = 0;
                    wrote_page = [];
                    received = 0;
                    bucket_id = Principal.fromText("aaaaa-aa");
                    file_type = "";
                    total_size = 0;
                    is_http_open = true;
                };
                let res = Array.init<FileBufExt>(buffer.size() + arr.size(), x);
                var i = 0;
                for(e in buffer.vals()){
                    res[i] := buffer[i];
                    i += 1;
                };
                for(e in arr.vals()){
                    res[i] := arr[i - buffer.size()];
                    i += 1;
                };
                res
            };
        }
    };

    // var型nat对的数组append
    public func appendBuffer(
        buffer : [var (Nat64, Nat64)], 
        arr : [var (Nat64, Nat64)]
    ) : [var (Nat64, Nat64)]{
        switch(buffer.size(), arr.size()) {
            case (0, 0) { [var] };
            case (0, _) { arr };
            case (_, 0) { buffer };
            case (xsSize, ysSize) {
                let res = Array.init<(Nat64, Nat64)>(buffer.size() + arr.size(), (0, 0));
                var i = 0;
                for(e in buffer.vals()){
                    res[i] := buffer[i];
                    i += 1;
                };
                for(e in arr.vals()){
                    res[i] := arr[i - buffer.size()];
                    i += 1;
                };
                res
            };
        }
    };

};