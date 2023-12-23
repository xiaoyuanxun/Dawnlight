import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/bucket/bucket.did.js"
import {StoreArgs} from "../declarations/bucket/bucket";
import {nanoid} from "nanoid"
import {bodhiApi} from "./bodhi";

const bucketId = "r4yar-zqaaa-aaaan-qlfja-cai"
const chunkSize = 2031616

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

  static async FileRead(file: File | Blob): Promise<Uint8Array[]> {
    try {
      return new Promise((resolve, reject) => {
        let start = 0;
        let currentChunk = 0;
        const total_index = Math.ceil(file.size / chunkSize)
        const allData: Array<Uint8Array> = []
        let reader = new FileReader();
        reader.onload = async function (e: any) {
          allData.push(new Uint8Array(e.target.result))
          if (currentChunk === total_index) return resolve(allData)
          else loadChunk()
        }
        reader.onerror = (error) => {
          reject(error)
        }
        const loadChunk = () => {
          const end = start + chunkSize;
          currentChunk++;
          reader.readAsArrayBuffer(file.slice(start, end));
          start = end;
        };
        loadChunk();
      })
    } catch (e) {
      throw e
    }
  }

  async storeFile(file: File) {
    try {
      const Actor = await Bucket.getActor()
      const allPromise: Array<Promise<any>> = []
      const key = nanoid()
      const file_extension = file.type
      const total_size = file.size
      const total_index = Math.ceil(total_size / chunkSize)
      console.log("total_index", total_index)
      const allData = await Bucket.FileRead(file)
      for (let i = 0; i < allData.length; i++) {
        const arg: StoreArgs = {
          file_type: file_extension,
          index: BigInt(i),
          value: allData[i],
          key,
          total_size: BigInt(file.size),
          total_index: BigInt(total_index)
        }
        allPromise.push(Actor.store(arg))
      }
      await Promise.all(allPromise)
      await bodhiApi.create(key)
    } catch (e) {
      throw e
    }
  }
}

export const bucketApi = new Bucket()
