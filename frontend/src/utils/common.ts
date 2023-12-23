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
