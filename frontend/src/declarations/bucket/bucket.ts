import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bucket {
  'get' : ActorMethod<[string, bigint], [] | [[Uint8Array | number[], string]]>,
  'getBuffers' : ActorMethod<[], Array<string>>,
  'getCycleBalance' : ActorMethod<[], bigint>,
  'getFileAsset' : ActorMethod<[string], [] | [FileAsset]>,
  'getFileTotalIndex' : ActorMethod<[string], bigint>,
  'getRecentFileAsset' : ActorMethod<[], Array<FileAsset>>,
  'getUserRecentFileAsset' : ActorMethod<[Principal], Array<FileAsset>>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'store' : ActorMethod<[StoreArgs], undefined>,
  'streamingCallback' : ActorMethod<
    [CallbackToken],
    StreamingCallbackHttpResponse
  >,
  'wallet_receive' : ActorMethod<[], bigint>,
}
export interface CallbackToken {
  'key' : string,
  'total_index' : bigint,
  'index' : bigint,
}
export interface CallbackToken__1 {
  'key' : string,
  'total_index' : bigint,
  'index' : bigint,
}
export interface FileAsset {
  'key' : string,
  'owner' : Principal,
  'time' : Time,
  'file_type' : string,
  'total_size' : bigint,
  'read_page_field' : Array<[bigint, bigint]>,
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamStrategy],
  'status_code' : number,
}
export interface StoreArgs {
  'key' : string,
  'value' : Uint8Array | number[],
  'total_index' : bigint,
  'file_type' : string,
  'total_size' : bigint,
  'index' : bigint,
}
export type StreamStrategy = {
    'Callback' : {
      'token' : CallbackToken__1,
      'callback' : [Principal, string],
    }
  };
export interface StreamingCallbackHttpResponse {
  'token' : [] | [CallbackToken__1],
  'body' : Uint8Array | number[],
}
export interface StreamingCallbackHttpResponse__1 {
  'token' : [] | [CallbackToken__1],
  'body' : Uint8Array | number[],
}
export type Time = bigint;
export interface _SERVICE extends Bucket {}
