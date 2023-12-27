import {Principal} from "@dfinity/principal";

export const sliceString = (str?: string) => {
  if (!str) return ""
  return str.substring(0, 3) + "..." + str.substring(str.length - 3, str.length)
}

export const stringToPrincipal = (str?: string): Principal => {
  try {
    return Principal.from(str)
  } catch (e) {
    throw e
  }
}

export const getSubAccount = (pr: Principal): Uint8Array => {
  // 将principalid转为Uint8Array
  const principalidUint8Array = pr.toUint8Array();

  // 创建一个长度为32的Uint8Array，默认所有元素为0
  const result = new Uint8Array(32);

  // 设置第一位为principalidUint8Array的长度
  result[0] = principalidUint8Array.length;

  // 将principalidUint8Array的内容复制到result中
  for (let i = 0; i < principalidUint8Array.length; i++) {
    result[i + 1] = principalidUint8Array[i];
  }

  return result;
}
