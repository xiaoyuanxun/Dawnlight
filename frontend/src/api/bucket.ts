import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/bucket/bucket.did.js"
import {StoreArgs} from "../declarations/bucket/bucket";
import {nanoid} from "nanoid"
import {bodhiApi} from "./bodhi";

const bucketId = "r4yar-zqaaa-aaaan-qlfja-cai"

export default class Bucket {

  private static async getActor() {
    return await getActor.createActor(idlFactory, bucketId);
  }

  async store(data: string) {
    const Data = new TextEncoder().encode(data)
    const actor = await Bucket.getActor()
    try {
      const fileKey = nanoid()
      const arg: StoreArgs = {
        key: fileKey,
        value: Data,
        total_index: BigInt(1),
        file_type: "text/plain",
        total_size: BigInt(Data.length),
        index: BigInt(0)
      }
      await actor.store(arg)
      await bodhiApi.create(fileKey)
    } catch (e) {
      console.log("store", e)
      throw e
    }
  }
}

export const bucketApi = new Bucket()
