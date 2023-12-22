import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";
import {idlFactory} from "../../declarations/bucket/bucket.did.js"


const bucketId = "r4yar-zqaaa-aaaan-qlfja-cai"

export default class Bucket {

  private static async getActor() {
    return await getActor.createActor(idlFactory, bucketId);
  }




}

export const bucketApi = new Bucket()
