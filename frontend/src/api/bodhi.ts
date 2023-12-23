import {idlFactory} from "../declarations/bodhi_backend/bodhi_backend.did.js";
import {getActor} from "../utils/Actor";
import {Asset, Result_1} from "../declarations/bodhi_backend/bodhi_backend";
import {Principal} from "@dfinity/principal";

const bodhi_cai = "g5r75-yaaaa-aaaan-qlgua-cai"

class Bodhi {
  private static async getActor() {
    return await getActor.createActor(idlFactory, bodhi_cai);
  }

  async create(fileKey: string): Promise<Principal> {
    const actor = await Bodhi.getActor()
    try {
      const res = await actor.create(fileKey) as Result_1
      if ("ok" in res) {
        return res.ok
      } else throw new Error(Object.keys(res.err)[0])
    } catch (e) {
      console.log("create", e)
      throw e
    }
  }

  async getAssetsEntries(): Promise<Asset[]> {
    const actor = await Bodhi.getActor()
    try {
      const res = await actor.getAssetsEntries() as [bigint, Asset][]
      return res.map(v => {
        return v[1]
      })
    } catch (e) {
      console.log("getAssetsEntries", e)
      throw e
    }
  }

}

export const bodhiApi = new Bodhi()
