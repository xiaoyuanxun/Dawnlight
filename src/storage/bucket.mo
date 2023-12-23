import Types "types";
import hash "mo:base/Hash";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import TrieSet "mo:base/TrieSet";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import SM "mo:base/ExperimentalStableMemory";
import HttpHandler "httpHandler";
import HashMap "mo:base/HashMap";
import Prim "mo:⛔";
import Int64 "mo:base/Int64";
import Time "mo:base/Time";
import Utils "utils";
import Order "mo:base/Order";

shared(installer) actor class Bucket() = this{
    private type Status                 = Types.Status;
    private type StoreArgs              = Types.StoreArgs;
    private type HttpRequest            = HttpHandler.HttpRequest;
    private type HttpResponse           = HttpHandler.HttpResponse;
    private type CallbackToken          = HttpHandler.CallbackToken;
    private type StreamingCallbackHttpResponse = HttpHandler.StreamingCallbackHttpResponse;
    private type BufferArgs             = Types.BufferArgs;
    private type FileAsset              = Types.FileAsset;

    private let CYCLE_THRESHOLD         = 3_000_000_000_000;
    private let MAX_PAGE_NUMBER : Nat64 = 458752; 
    private let THRESHOLD : Nat64       = 30064771072; // 28G
    private let MAX_UPDATE_SIZE : Nat64 = 2031616; // (2M - 64KB)
    private let MAX_QUERY_SIZE : Nat64  = 3080192; // 3M - 64KB 
    private let MAX_UPDATE_PAGE : Nat64 = 31; // 对应MAX_UPDATE_SIZE
    private let MAX_QUERY_PAGE : Nat64 = 47; // 对应MAX_QUERY_SIZE
    private let PageBytes: Nat64 = 65536;
    private stable var offset : Nat64   = 0;
    private stable var assets_entries : [var (Text, FileAsset)] = [var];
    private stable var logs_entries : [var (Nat, Status)] = [var];
    private stable var log_index : Nat = 0;
    private stable var chip_set = TrieSet.empty<(Nat64,  Nat64)>(); // chip pagefield
    private stable var all_chip_page : Nat64    = 0; 
    private stable var max_chip : (Nat64,  Nat64) = (0, 0); // max size chip

    private var assets : TrieMap.TrieMap<Text, FileAsset> =  TrieMap.fromEntries<Text, FileAsset>(assets_entries.vals(), Text.equal, Text.hash);
    private var buffer = TrieMap.TrieMap<Text, BufferArgs>(Text.equal, Text.hash); 
    private var logs : TrieMap.TrieMap<Nat, Status> = TrieMap.fromEntries<Nat, Status>(logs_entries.vals(), Nat.equal, hash.hash);
    
    public query func getRecentFileAsset(): async [FileAsset] {
        Iter.toArray<FileAsset>(
            Iter.sort<FileAsset>(
                assets.vals(),
                func (x: FileAsset, y: FileAsset): Order.Order {
                    if(x.time > y.time) #less
                    else if(x.time == y.time) #equal
                    else #greater
                }
            )
        )
    };

    public query func getUserRecentFileAsset(user: Principal): async [FileAsset] {
        Iter.toArray<FileAsset>(
            Iter.sort<FileAsset>(
                Iter.filter<FileAsset>(
                    assets.vals(),
                    func (x: FileAsset): Bool {
                        x.owner == user
                    }
                ),
                func (x: FileAsset, y: FileAsset): Order.Order {
                    if(x.time > y.time) #less
                    else if(x.time == y.time) #equal
                    else #greater
                }
            )
        )
    };

    public query func getCycleBalance(): async Nat {
        Cycles.balance()
    };
    
    public query func get(key: Text, index: Nat): async ?(Blob, Text) {
        do ?{
            let ase = assets.get(key)!;
            if (index + 1 == ase.read_page_field.size()) {
                let res : Nat64 = if (ase.total_size % PageBytes == 0) {
                    ase.total_size
                } else {
                    ase.total_size % PageBytes
                };
                (SM.loadBlob(ase.read_page_field[index].0 * PageBytes, Nat64.toNat((ase.read_page_field[index].1 - 1) * PageBytes) + Nat64.toNat(res)) , ase.file_type)
            } else {
                (_loadFromSM(ase.read_page_field[index].0, ase.read_page_field[index].1), ase.file_type)
            }
        }
    };

    public query func getFileAsset(key: Text): async ?FileAsset {
        switch(assets.get(key)) {
            case(null) return null;
            case(?_asset) return ?_asset;
        };
    };

    public query func getFileTotalIndex(key: Text): async Nat {
        switch(assets.get(key)) {
            case(null) { return 0;};
            case(?ase) { return ase.read_page_field.size();};
        }
    };

    public query({caller}) func getBuffers(): async [Text] {
        Iter.toArray(buffer.keys())
    };

    public query func http_request(request : HttpRequest) : async HttpResponse{
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));
        if (path.size() == 1) {
            switch(_get(path[0], 0)) { 
                case(#err(_err)) return build_404_1();
                case(#ok(payload)) {
                    switch(assets.get(path[0])) {
                        case(null) return build_404_1();
                        case(?ase) {
                            if(ase.read_page_field.size() > 1) { // total_index
                                return HttpHandler.build_200({
                                    body = payload.0;
                                    _type = ?payload.1;
                                    ttl = HttpHandler.DEFAULT_TTL;
                                    streaming_strategy = ?#Callback{
                                        callback = streamingCallback;
                                        token = {
                                            index = 1; // 0 .. n-1
                                            total_index = ase.read_page_field.size();
                                            key = path[0];
                                        };
                                    };
                                })
                            } else {
                                return HttpHandler.build_200({
                                    body = payload.0;
                                    _type = ?payload.1;
                                    ttl = HttpHandler.DEFAULT_TTL;
                                    streaming_strategy = null;
                                });
                            };
                        };
                    };
                };
            };
        };
        build_404_3()
    };

    public query func streamingCallback(token: CallbackToken): async StreamingCallbackHttpResponse {
        switch(_get(token.key, token.index)) {
            case(#err(_err)) return {
                body = "": Blob;
                token = null;
            };
            case(#ok(payload)) {
                if(token.index + 1 == token.total_index) {
                    return {
                        body = payload.0;
                        token = null;
                    };
                } else {
                    return {
                        body = payload.0;
                        token = ?{
                            index = token.index + 1;
                            total_index = token.total_index;
                            key = token.key;
                        };
                    };
                };
            };
        };
    };

    public shared({caller}) func store(args: StoreArgs): async () {
        switch(assets.get(args.key)) {
            case (null) {
                switch(buffer.get(args.key)) {
                    case(null) {
                        let (read_page_field, write_page_field) = _preAlo(args.total_size);
                        let bf : BufferArgs = {
                            total_index = args.total_index;
                            total_size = args.total_size;
                            read_page_field = read_page_field;
                            write_page_field = write_page_field;
                            wrote_page = Array.init<Bool>(args.total_index, false);
                            var received = 0;
                        };
                        buffer.put(args.key, bf);
                    };
                    case(?buf) {};
                };
                _upload(args, caller);
            };
            case (?field) {};
        };
    };
    
    private func _chipMerge() {
        let chiparray : [(Nat64, Nat64)] = Array.sort(TrieSet.toArray<(Nat64, Nat64)>(chip_set), Utils.compareStart);
        var buffer : [var (Nat64, Nat64)] = [var];
        var tail : Nat64 = 0;
        var head : Nat64 = 0;
        for ((start, size) in chiparray.vals()) {
            if (tail != start) {
                if (tail != 0) {
                    buffer := Utils.appendBuffer(buffer, [var (head, tail - head + 1)]);
                };
                head := start;
            };
            tail := start + size;
        };
        buffer := Utils.appendBuffer(buffer, [var (head, tail - head + 1)]);
        let res = Array.freeze<(Nat64, Nat64)>(buffer);
        max_chip := Utils.maxNatArray(res);
        chip_set := TrieSet.fromArray<(Nat64, Nat64)>(res, Utils.pairHash, Utils.pairEqual);        
    };

    private func _upload(args: StoreArgs, owner: Principal) {
        switch (buffer.get(args.key)) {
            case (?buf) {
                if (buf.wrote_page[args.index] == false) {
                    buf.wrote_page[args.index] := true;
                    buf.received += 1;

                    _storageData(buf.write_page_field[args.index], args.value);
                                     
                    if (buf.received == buf.total_index) {
                        assets.put(args.key, {
                            key = args.key;
                            read_page_field = buf.read_page_field;
                            file_type = args.file_type;
                            total_size = args.total_size;
                            owner = owner;
                            time = Time.now();
                        });
                        buffer.delete(args.key);
                    };
                };
            };
            case (null) {};
        };
    };

    private func build_404_1(): HttpResponse {
        {
            status_code = 404;
            headers = [("Content-Type", "text/plain; version=0.0.4")];
            body = Text.encodeUtf8("Assets do not have this file");
            streaming_strategy = null;
        }
    };

    private func build_404_2(): HttpResponse {
        {
            status_code = 404;
            headers = [("Content-Type", "text/plain; version=0.0.4")];
            body = Text.encodeUtf8("This file not HttpOpen");
            streaming_strategy = null;
        }
    };

    private func build_404_3(): HttpResponse {
        {
            status_code = 404;
            headers = [("Content-Type", "text/plain; version=0.0.4")];
            body = Text.encodeUtf8("Wrong Url Format");
            streaming_strategy = null;
        }
    };

    private func _appendBuffer(
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

    // 获取合适的碎片
    private func _getSuitableChip(total_page : Nat64, chip_array : [(Nat64, Nat64)]) : (Nat64, Nat64) {
        var left = 0;
        var right : Nat = chip_array.size() - 1;
        var mid = (left + right + 1) / 2;
        while (left < right) {
            if (chip_array[mid].1 >= total_page) {
                left := mid;
            } else {
                right := mid - 1; 
            };
            mid := (left + right + 1) / 2;
        };
        chip_array[left]
    };
    
    // 获得第chunk_number个的write_page的大小，即第chunk_number个chunk中数据的大小
    private func _getWritePageSize(write_page_index : Nat, chunk_number : Nat, total_page : Nat64) : Nat64 {
        if (write_page_index == (chunk_number - 1 : Nat)) {
            total_page % MAX_UPDATE_PAGE
        } else {
            MAX_UPDATE_PAGE
        }
    };

    private func get_chunk_number(total_size: Nat64): Nat64 {
        if(total_size % MAX_UPDATE_SIZE == 0) {
            return total_size / MAX_UPDATE_SIZE;
        } else {
            return total_size / MAX_UPDATE_SIZE + 1;
        };
    }; 

    //根据预分配好的read_page_field分成chunk_number个read_page，以便于将各chunk的数据写入对应的read_page中
    private func _PageField(read_page_field : [(Nat64, Nat64)], total_size : Nat64, total_page: Nat64) : [[(Nat64, Nat64)]] {
        let chunk_number : Nat = Nat64.toNat(get_chunk_number(total_size));
        var write_page_field = Array.init<[(Nat64, Nat64)]>(chunk_number, []);
        var write_page_size : Nat64 = 0; 
        var ptr : Nat64 = read_page_field[0].0;
        var read_page_size : Nat64 = read_page_field[0].1;
        var read_page_index : Nat = 0;

        label l for (write_page_index in Iter.range(0, chunk_number - 1)) {
            var res : [var (Nat64, Nat64)] = [var];
            write_page_size := _getWritePageSize(write_page_index, chunk_number, total_page);
            while (write_page_size > 0 and read_page_index < read_page_field.size()) {
                if (read_page_size > write_page_size) {
                    res := Utils.appendBuffer(res, [var (ptr, write_page_size)]);
                    ptr += write_page_size;
                    read_page_size -= write_page_size;
                    write_page_size := 0;
                } else {
                    res := Utils.appendBuffer(res, [var (ptr, read_page_size)]);
                    ptr += read_page_size;
                    write_page_size -= read_page_size;   
                    read_page_index += 1;  

                    if (read_page_index < read_page_field.size()) {
                        ptr := read_page_field[read_page_index].0;
                        read_page_size := read_page_field[read_page_index].1;
                    };
                }
            };
            write_page_field[write_page_index] := Array.freeze<(Nat64, Nat64)>(res);
        };
        Array.freeze<[(Nat64, Nat64)]>(write_page_field)
    };

    private func get_total_page(total_size: Nat64): Nat64 {
        if(total_size % PageBytes == 0) {
            total_size / PageBytes
        } else {
            total_size / PageBytes + 1
        }
    };

    // return [readPagfield, writePagefield]
    private func _preAlo(total_size : Nat64) : ([(Nat64, Nat64)], [[(Nat64, Nat64)]]) {
        // 当没有chip时，全部使用SM内存
        if (TrieSet.size(chip_set) == 0) {
            // [(页的序号， 页的长度)] 
            var res : [var (Nat64, Nat64)] = [var];
            let growPage = _growStableMemoryPage(total_size);
            var start : Nat64 = offset;
            var ptr : Nat64 = start;
            offset += growPage;
            
            label l loop {
                if (growPage <= MAX_QUERY_PAGE) { 
                    res := [var (start, growPage)];
                    break l;
                } else if (ptr + MAX_QUERY_PAGE < start + growPage) {
                    res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                    ptr += MAX_QUERY_PAGE;
                } else {
                    res := Utils.appendBuffer(res, [var (ptr, start + growPage - ptr)]);
                    break l;
                };
            };
            return (Array.freeze(res), _PageField(Array.freeze(res), total_size, growPage));
        } else {
            // 如果可用页的SM小于3M，相当于剩余页小于MAX_QUERY_PAGE,
            // 直接当作chip处理，加入chip_set，如果还有可用SM，那一定大于3M
            if (offset < MAX_PAGE_NUMBER) {
                let unallocated_stable_memory_page : Nat64 = MAX_PAGE_NUMBER - offset;
                if (unallocated_stable_memory_page < MAX_QUERY_PAGE) {
                    let start : Nat64 = offset;
                    ignore SM.grow(unallocated_stable_memory_page);
                    offset := MAX_PAGE_NUMBER;

                    let new_chip : (Nat64, Nat64) = (start, unallocated_stable_memory_page);
                    chip_set := TrieSet.put<(Nat64, Nat64)>(chip_set, new_chip, Utils.pairHash(new_chip), Utils.pairEqual);
                    all_chip_page += unallocated_stable_memory_page;
                };
            };

            // 获取根据size降序排列的chip_array，更新max_chip
            var res : [var (Nat64, Nat64)] = [var];
            let chip_array : [(Nat64, Nat64)] = Array.sort(TrieSet.toArray<(Nat64, Nat64)>(chip_set), Utils.compareSizeDescend);
            max_chip := chip_array[0];

            let total_page = get_total_page(total_size);
            // 当total_page小于max_chip_size时，直接存入最适合大小的chip
            if (total_page <= max_chip.1) {
                let suitable_chip = _getSuitableChip(total_page, chip_array);
                var start : Nat64 = suitable_chip.0;
                var ptr : Nat64 = start;

                label l loop {
                    if (total_page <= MAX_QUERY_PAGE) {
                        res := [var (start, total_page)];
                        break l;
                    } else if (ptr + MAX_QUERY_PAGE < start + total_page) {
                        res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                        ptr += MAX_QUERY_PAGE;
                    } else {
                        res := Utils.appendBuffer(res, [var (ptr, start + total_page - ptr)]);
                        break l;
                    };
                };

                // 当suitable_chip没用完时，将剩余的chip存入chip_set中
                chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, suitable_chip, Utils.pairHash(suitable_chip), Utils.pairEqual);
                if (suitable_chip.1 > total_page) {
                    let new_chip : (Nat64, Nat64) = (suitable_chip.0 + total_page, suitable_chip.1 - total_page);
                    chip_set := TrieSet.put<(Nat64, Nat64)>(chip_set, new_chip, Utils.pairHash(new_chip), Utils.pairEqual);
                };
                all_chip_page -= total_page;

                // 如果用的chip是max_chip，需要更新max_chip
                if (suitable_chip == max_chip) {
                    let new_chip : (Nat64, Nat64) = (suitable_chip.0 + total_page, suitable_chip.1 - total_page);
                    // 当只有chip_set中只有一片chip时，如果还有剩余，那剩余的chip就是max_chip
                    if (chip_array.size() == 1) {
                        if (new_chip.1 > 0) {
                            max_chip := new_chip;
                        } else {
                            max_chip := (0, 0);
                        };
                    // // 当只有chip_set中只有一片chip时，就将剩余chip的空间和第二大chip的空间相比较
                    } else {
                        if (new_chip.1 > chip_array[1].1) {
                            max_chip := new_chip;
                        } else {
                            max_chip := chip_array[1];
                        };
                    };
                };
            } else {
                // 当一片chip存不下文件时，寻找大于3M的chip，使用chip中连续3M的空间
                var remain_size_page : Nat64 = get_total_page(total_size);
                label l for (chip in chip_array.vals()) {
                    if (chip.1 < MAX_QUERY_PAGE) {
                        break l;
                    } else if (remain_size_page < MAX_QUERY_PAGE){
                        break l;
                    } else {
                        var ptr : Nat64 = chip.0;
                        for (i in Iter.range(1, Int64.toInt(Int64.fromNat64(chip.1 / MAX_QUERY_PAGE)) ) ) {
                            res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                            ptr += MAX_QUERY_PAGE;
                        };
                        chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, chip, Utils.pairHash(chip), Utils.pairEqual);
                        var used_page : Nat64 = chip.1 / MAX_QUERY_PAGE * MAX_QUERY_PAGE;
                        if (chip.1 > used_page) {
                            let new_chip : (Nat64, Nat64) = (chip.0 + used_page, chip.1 - used_page);
                            chip_set := TrieSet.put<(Nat64, Nat64)>(chip_set, new_chip, Utils.pairHash(new_chip), Utils.pairEqual);
                        };
                        all_chip_page -= used_page;
                        remain_size_page -= used_page;
                    };
                };
                // 当chip刚好存完，更新max_chip
                if (remain_size_page == 0) {
                    max_chip := Utils.maxNatArray(TrieSet.toArray<(Nat64, Nat64)>(chip_set));
                // 使用完chip中连续3M的空间后还有剩余文件
                } else {
                    let new_chip_array : [(Nat64, Nat64)] = Array.sort(TrieSet.toArray<(Nat64, Nat64)>(chip_set), Utils.compareSizeDescend);
                    let new_chip_array_size : Nat = new_chip_array.size();
                    let unallocated_stable_memory_page : Nat64 = MAX_PAGE_NUMBER - offset;
                    max_chip := new_chip_array[0];
                    // 当未分配的SM内存比剩余文件少时
                    if (unallocated_stable_memory_page < remain_size_page) {
                        // 如果未分配的SM内存大于3M，说明存在未分配的SM内存
                        // 先使用未分配的SM内存，剩余的文件再放入chip
                        if (unallocated_stable_memory_page > MAX_QUERY_PAGE) {
                            remain_size_page -= unallocated_stable_memory_page;
                            var start : Nat64 = offset;
                            var ptr : Nat64 = start;
                            ignore SM.grow(unallocated_stable_memory_page);
                            offset += unallocated_stable_memory_page;

                            label l loop {
                                if (ptr + MAX_QUERY_PAGE < start + unallocated_stable_memory_page) {
                                    res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                                    ptr += MAX_QUERY_PAGE;
                                } else {
                                    res := Utils.appendBuffer(res, [var (ptr, start + unallocated_stable_memory_page - ptr)]);
                                    break l;
                                };
                            };
                        };

                        // 使用完未分配的SM内存后，剩余的文件再放入chip
                        var chip_index : Nat = 0;
                        var ptr : Nat64 = new_chip_array[chip_index].0;
                        var chip_size : Nat64 = new_chip_array[chip_index].1;
                        while (remain_size_page > 0) {
                            // 剩余文件的大小大于当前chip的大小
                            if (remain_size_page > chip_size) {
                                res := Utils.appendBuffer(res, [var (ptr, chip_size)]);
                                remain_size_page -= chip_size;
                                chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, new_chip_array[chip_index], Utils.pairHash(new_chip_array[chip_index]), Utils.pairEqual);
                                all_chip_page -= new_chip_array[chip_index].1;

                                chip_index += 1;
                                assert(chip_index < new_chip_array_size);
                                ptr := new_chip_array[chip_index].0;
                                chip_size := new_chip_array[chip_index].1;
                            // 剩余文件的大小等于当前chip的大小
                            } else if (remain_size_page == chip_size) {
                                res := Utils.appendBuffer(res, [var (ptr, remain_size_page)]);
                                remain_size_page -= remain_size_page;
                                chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, new_chip_array[chip_index], Utils.pairHash(new_chip_array[chip_index]), Utils.pairEqual);
                                all_chip_page -= new_chip_array[chip_index].1;

                                // 判断max_chip
                                if ((chip_index + 1 : Nat) < new_chip_array_size) {
                                    max_chip := new_chip_array[chip_index + 1];
                                } else {
                                    max_chip := (0, 0);
                                };
                            // 剩余文件的大小小于当前chip的大小
                            } else {
                                res := Utils.appendBuffer(res, [var (ptr, remain_size_page)]);
                                chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, new_chip_array[chip_index], Utils.pairHash(new_chip_array[chip_index]), Utils.pairEqual);
                                all_chip_page -= remain_size_page;

                                var new_chip : (Nat64, Nat64) = (ptr + remain_size_page, chip_size - remain_size_page);
                                chip_set := TrieSet.put<(Nat64, Nat64)>(chip_set, new_chip, Utils.pairHash(new_chip), Utils.pairEqual);
                                remain_size_page -= remain_size_page;
                                // 判断max_chip
                                if ((chip_index + 1 : Nat) < new_chip_array_size) {
                                    if (new_chip.1 < new_chip_array[chip_index + 1].1) {
                                        max_chip := new_chip_array[chip_index + 1];
                                    } else {
                                        max_chip := new_chip;
                                    };
                                } else {
                                    max_chip := new_chip;
                                };
                            };
                        };
                    // 当未分配的SM内存比剩余文件多时，保证min_query_times的条件下，尽可能用chip
                    // 剩余文件刚好是3M的倍数，直接全部放SM里
                    } else if (remain_size_page % MAX_QUERY_PAGE == 0) {
                        var start : Nat64 = offset;
                        var ptr : Nat64 = start;
                        ignore SM.grow(remain_size_page);
                        offset += remain_size_page;

                        for (i in Iter.range(1, Int64.toInt(Int64.fromNat64(remain_size_page / MAX_QUERY_PAGE)) )) {
                            res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                            ptr += MAX_QUERY_PAGE;
                        };
                    // 剩余文件不是3M的倍数，可能SM和chip都存
                    } else {
                        let min_query_times : Nat64 = remain_size_page / MAX_QUERY_PAGE + 1;
                        // 只能全部用SM存
                        if ((min_query_times - 1 : Nat64) * MAX_QUERY_PAGE + new_chip_array[0].1 < remain_size_page) {
                            var start : Nat64 = offset;
                            var ptr : Nat64 = start;
                            ignore SM.grow(remain_size_page);
                            offset += remain_size_page;
                            
                            label l loop {
                                if (remain_size_page <= MAX_QUERY_PAGE) {
                                    res := Utils.appendBuffer(res, [var (start, remain_size_page)]);
                                    break l;
                                } else if (ptr + MAX_QUERY_PAGE < start + remain_size_page) {
                                    res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                                    ptr += MAX_QUERY_PAGE;
                                } else {
                                    res := Utils.appendBuffer(res, [var (ptr, start + remain_size_page - ptr)]);
                                    break l;
                                };
                            };
                        // SM和chip都存
                        } else {
                            // chip数量比min_query_times多时，可使用的chip数量chip_number等于min_query_times，反之就等于new_chip_array_size，缺少的chip直接用SM代替
                            let chip_number : Nat64 = if (Nat64.fromNat(new_chip_array_size) >= min_query_times) {min_query_times} else { Nat64.fromNat(new_chip_array_size)};
                            var use_chip_page : Nat64 = 0;
                            var use_chip_number : Nat64 = 0;
                            var sum_page : Nat64 = 0;

                            // 判断应该使用的chip数量最多是多少
                            label l for (i in Iter.range(1, Int64.toInt(Int64.fromNat64(chip_number)))) {
                                let ii = Nat64.fromNat(i);
                                use_chip_page += new_chip_array[i - 1].1;
                                sum_page := (min_query_times - ii) * MAX_QUERY_PAGE + use_chip_page;
                                if (sum_page < remain_size_page) {
                                    use_chip_number := ii - 1;
                                    break l;
                                };
                                if (ii == chip_number) {
                                    use_chip_number := ii;
                                    break l;
                                }
                            };

                            // 需要存chip里的remain_size
                            remain_size_page -= (min_query_times - use_chip_number) * MAX_QUERY_PAGE;
                            for (i in Iter.range(0, Int64.toInt(Int64.fromNat64(use_chip_number - 1)))) {
                                if (Nat64.fromNat(i) < (use_chip_number - 1 : Nat64)) {
                                    res := Utils.appendBuffer(res, [var (new_chip_array[i].0, new_chip_array[i].1)]);
                                    chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, new_chip_array[i], Utils.pairHash(new_chip_array[i]), Utils.pairEqual);
                                    all_chip_page -= new_chip_array[i].1;
                                    remain_size_page -= new_chip_array[i].1;
                                // 最后一片chip可能用不完
                                } else {
                                    var old_chip : (Nat64, Nat64) = new_chip_array[i];
                                    res := Utils.appendBuffer(res, [var (old_chip.0, remain_size_page)]);
                                    chip_set := TrieSet.delete<(Nat64, Nat64)>(chip_set, old_chip, Utils.pairHash(old_chip), Utils.pairEqual);
                                    if (old_chip.1 > remain_size_page) {
                                        var new_chip : (Nat64, Nat64) = (old_chip.0 + remain_size_page, old_chip.1 - remain_size_page);
                                        chip_set := TrieSet.put<(Nat64, Nat64)>(chip_set, new_chip, Utils.pairHash(new_chip), Utils.pairEqual);
                                        if ((i + 1 : Nat) <  new_chip_array_size) {
                                            if (new_chip.1 < new_chip_array[i + 1].1) {
                                                max_chip := new_chip_array[i + 1];
                                            } else {
                                                max_chip := new_chip;
                                            };
                                        } else {
                                            max_chip := new_chip;
                                        };
                                    } else {
                                        if ((i + 1 : Nat) < new_chip_array_size) {
                                            max_chip := new_chip_array[i + 1];
                                        } else {
                                            max_chip := (0, 0);
                                        };   
                                    };
                                    all_chip_page -= remain_size_page;
                                };
                            };

                            // 需要存SM里的remain_size
                            if (min_query_times > use_chip_number) { 
                                var start : Nat64 = offset;
                                var ptr : Nat64 = start;
                                ignore SM.grow((min_query_times - use_chip_number) * MAX_QUERY_PAGE);
                                offset += (min_query_times - use_chip_number) * MAX_QUERY_PAGE;

                                for (i in Iter.range(1, Int64.toInt(Int64.fromNat64(min_query_times - use_chip_number)))) {
                                    res := Utils.appendBuffer(res, [var (ptr, MAX_QUERY_PAGE)]);
                                    ptr += MAX_QUERY_PAGE;
                                };
                            };
                        }
                    }
                }
            };
            return (Array.freeze(res), _PageField(Array.freeze(res), total_size, getChipPages(Array.freeze(res))));
        };
    };

    private func getChipPages(res: [(Nat64, Nat64)]): Nat64 {
        var total_page: Nat64 = 0;
        for(i in res.vals()) {
            total_page += i.1;
        };
        total_page
    };

    private func _get(key : Text, index : Nat) : Result.Result<(Blob, Text), ()> {
        switch(assets.get(key)) {
            case(null) { 
                #err(())
            };
            case(?ase) {
                if (index + 1 == ase.read_page_field.size()) {
                    let res : Nat64 = if (ase.total_size % PageBytes == 0) {
                        ase.total_size
                    } else {
                        ase.total_size % PageBytes
                    };
                    #ok((SM.loadBlob(ase.read_page_field[index].0 * PageBytes, Nat64.toNat((ase.read_page_field[index].1 - 1) * PageBytes) + Nat64.toNat(res)) , ase.file_type))
                } else {
                    #ok((_loadFromSM(ase.read_page_field[index].0, ase.read_page_field[index].1), ase.file_type))
                }
            };
        }
    };

    private func _loadFromSM(_offset : Nat64, length : Nat64) : Blob {
        SM.loadBlob(_offset * PageBytes, Nat64.toNat(length * PageBytes))
    };

    // put时根据分配好的write_page以vals的形式写入数据
    func _storageData(write_page : [(Nat64, Nat64)], data : Blob) {
        var index : Nat = 0;
        var page_start = write_page[index].0;
        var page_size = write_page[index].1;
        var ptr = page_start * PageBytes;
        for(byte in data.vals()){
            if (ptr == (page_start * PageBytes + page_size * PageBytes)) {
                index += 1;
                assert(index < write_page.size());
                page_start := write_page[index].0;
                page_size := write_page[index].1;
                ptr := page_start * PageBytes;
            };
            SM.storeNat8(ptr, byte);
            ptr += 1;
        };
    };

    private func _growStableMemoryPage(size : Nat64): Nat64 {
        var growPage: Nat64 = 0;
        if (size % PageBytes == 0) {
            // growPage := size >> 16;
            growPage := size / PageBytes;
        } else {
            // growPage := size >> 16 + 1;
            growPage := size / PageBytes + 1;
        };
        ignore SM.grow(growPage);
        growPage
    };

    public shared func wallet_receive() : async Nat{
        Cycles.accept(Cycles.available())
    };

    system func preupgrade() {
        let fs: FileAsset = {
            key = "";
            read_page_field = [];
            file_type = "";
            total_size = 0;
            owner = Principal.fromText("2vxsx-fae");
            time = 0;
        };
        assets_entries := Array.init<(Text, FileAsset)>(assets.size(), ("", fs));
        var assets_index = 0;
        for (a in assets.entries()) {
            assets_entries[assets_index] := (a.0, a.1);
            assets_index += 1;
        };
    };

    system func postupgrade() {
        assets_entries := [var];
    };
};