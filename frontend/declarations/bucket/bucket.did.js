export const idlFactory = ({ IDL }) => {
  const FileAsset = IDL.Record({
    'owner' : IDL.Principal,
    'file_type' : IDL.Text,
    'total_size' : IDL.Nat64,
    'read_page_field' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const CallbackToken__1 = IDL.Record({
    'key' : IDL.Text,
    'total_index' : IDL.Nat,
    'index' : IDL.Nat,
  });
  const StreamingCallbackHttpResponse__1 = IDL.Record({
    'token' : IDL.Opt(CallbackToken__1),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : CallbackToken__1,
      'callback' : IDL.Func(
          [CallbackToken__1],
          [StreamingCallbackHttpResponse__1],
          ['query'],
        ),
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamStrategy),
    'status_code' : IDL.Nat16,
  });
  const StoreArgs = IDL.Record({
    'key' : IDL.Text,
    'value' : IDL.Vec(IDL.Nat8),
    'total_index' : IDL.Nat,
    'file_type' : IDL.Text,
    'total_size' : IDL.Nat64,
    'index' : IDL.Nat,
  });
  const CallbackToken = IDL.Record({
    'key' : IDL.Text,
    'total_index' : IDL.Nat,
    'index' : IDL.Nat,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(CallbackToken__1),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const Bucket = IDL.Service({
    'get' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Opt(IDL.Tuple(IDL.Vec(IDL.Nat8), IDL.Text))],
        ['query'],
      ),
    'getBuffers' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getCycleBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'getFileAsset' : IDL.Func([IDL.Text], [IDL.Opt(FileAsset)], ['query']),
    'getFileTotalIndex' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'store' : IDL.Func([StoreArgs], [], []),
    'streamingCallback' : IDL.Func(
        [CallbackToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'wallet_receive' : IDL.Func([], [IDL.Nat], []),
  });
  return Bucket;
};
export const init = ({ IDL }) => { return []; };
