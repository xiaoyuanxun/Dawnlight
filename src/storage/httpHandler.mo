module{
    public type HeaderField = (Text, Text);
    public type CallbackToken = {
        index: Nat;
        total_index: Nat;
        key: Text;
    };
    public type StreamingCallbackHttpResponse = {
        body: Blob;
        token: ?CallbackToken;
    };
    public type StreamStrategy = {
        #Callback: {
            callback: query (CallbackToken) -> async (StreamingCallbackHttpResponse);
            token: CallbackToken;
        }
    };
    public type HttpRequest = {
        method: Text;
        url: Text;
        headers: [HeaderField];
        body: Blob;
    };
    public type HttpResponse = {
        status_code: Nat16;
        headers: [HeaderField];
        body: Blob;
        streaming_strategy: ?StreamStrategy;
    };

    public let DEFAULT_TTL = 31536000; // 1 year
    
    public type Build200Args = {
        body : Blob;
        _type : ?Text;
        ttl : Nat;
        streaming_strategy : ?StreamStrategy
    };

    public func build_200(args : Build200Args) : HttpResponse{
        switch(args._type){
            case null{
                if(args.ttl == 0){
                    {
                        body = args.body;
                        headers = [
                            ("Content-Type", "text/html;charset=utf-8")
                        ];
                        streaming_strategy = args.streaming_strategy;
                        status_code = 200;
                    }
                }else{
                    {
                        body = args.body;
                        headers = [
                            ("Content-Type", "text/html;charset=utf-8"),
                            ("Cache-Control", "max-age="#debug_show(args.ttl))
                        ];
                        streaming_strategy = args.streaming_strategy;
                        status_code = 200;
                    }
                }
            };
            case (?t){
                {
                    body = args.body;
                    headers = [
                        ("Content-Type", t # ";charset=utf-8"),
                        ("Cache-Control", "max-age=31536000") // 1 year
                    ];
                    streaming_strategy = args.streaming_strategy;
                    status_code = 200;
                }
            }
        }
    };


}