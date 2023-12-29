use candid::{CandidType, Deserialize, Principal, Encode, Decode, Nat};
use serde_bytes::{self, ByteBuf};
use std::path::Path;
use std::fs::{self};

pub const MAX_UPDATE_SIZE: usize = 2031616;

#[derive(CandidType, Deserialize, Debug)]
pub struct StoreArgs {
  pub key: String,
  pub value: serde_bytes::ByteBuf,
  pub total_index: candid::Nat,
  pub file_type: String,
  pub total_size: u64,
  pub index: candid::Nat,
}

pub async fn store(
  bucket_canister: Principal,
  call_agent: ic_agent::Agent,
  key: String,
  file_path_str: &str,
) {
  let file_path = Path::new(file_path_str);
  let file_extension = String::from(get_file_type(
      file_path.extension().unwrap().to_str().unwrap(),
  ));
  let (file_size, data_slice) = get_file_from_source(file_path_str);
  
  let puts = build_store_args(
      key,
      file_extension,
      file_size.try_into().unwrap(),
      &data_slice
  );
  for put in &puts {
    let _response_blob = call_agent
      .update(&bucket_canister, "store")
      .with_arg(Encode!(put).expect("encode piece failed"))
      .call_and_wait()
      .await
      .expect("response error");
  }
}

fn build_store_args(
  file_key: String,
  file_extension: String,
  total_size: u128,
  data_slice: &Vec<Vec<u8>>,
) -> Vec<StoreArgs> {
  let mut order = 0;
  let mut puts = vec![];
  for data in data_slice {
      puts.push(StoreArgs {
          key: file_key.clone(),
          value: ByteBuf::from(data.to_owned()),
          total_index: Nat::from(data_slice.len()),
          file_type: file_extension.clone(),
          total_size: total_size.clone() as u64,
          index: Nat::from(order.clone() as usize),
      });
      order += 1;
  }
  puts
}

// Access file from file path, slice and return [each slice] array
fn get_file_from_source(path: &str) -> (usize, Vec<Vec<u8>>) {
  let context = fs::read(path).expect("read file failed");
  let size = context.len();
  let slice_size = if context.len() % MAX_UPDATE_SIZE == 0 {
      context.len() / MAX_UPDATE_SIZE
  } else {
      context.len() / MAX_UPDATE_SIZE + 1
  };
  let mut res = Vec::new();
  for index in 0..slice_size {
      if index == slice_size - 1 {
          res.push(context[index * MAX_UPDATE_SIZE..context.len()].to_owned())
      } else {
          res.push(context[index * MAX_UPDATE_SIZE..(index + 1) * MAX_UPDATE_SIZE].to_owned())
      }
  }
  (size, res)
}

fn get_file_type(file_type: &str) -> &str {
  if file_type == "pdf" {
      return "application/pdf";
  } else if file_type == "jpg" || file_type == "jpeg" {
      return "image/jpg";
  } else if file_type == "png" {
      return "image/png";
  } else if file_type == "mp4" {
      return "video/mp4";
  } else if file_type == "mp3" {
      return "audio/mp3";
  } else if file_type == "gif" {
      return "image/gif";
  } else if file_type == "txt" {
      return "text/plain";
  } else if file_type == "ppt" || file_type == "pptx" {
      return "application/vnd.ms-powerpoint";
  } else if file_type == "html" || file_type == "xhtml" {
      return "text/html";
  } else if file_type == "doc" || file_type == "docx" {
      return "application/msword";
  } else if file_type == "xls" {
      return "application/x-xls";
  } else if file_type == "apk" {
      return "application/vnd.android.package-archive";
  } else if file_type == "svg" {
      return "text/xml";
  } else if file_type == "wmv" {
      return "video/x-ms-wmv";
  } else {
      return "application/octet-stream";
  }
}