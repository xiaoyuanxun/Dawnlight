import {idlFactory} from "../declarations/bodhi_backend/bodhi_backend.did.js";
import {getActor} from "../utils/Actor";
import {Asset, Result_1} from "../declarations/bodhi_backend/bodhi_backend";
import {Principal} from "@dfinity/principal";

const bodhi_cai = "g5r75-yaaaa-aaaan-qlgua-cai"

export type shareAsset = Asset & {
  share: number
}

class Bodhi {
  private static async getActor() {
    return await getActor.createActor(idlFactory, bodhi_cai);
  }

  private static async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, bodhi_cai)
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

  async getAsset(assetId: number): Promise<Asset> {
    const actor = await Bodhi.getActor()
    try {
      const res = await actor.getAsset(BigInt(assetId)) as [] | [Asset]
      if (res[0]) return res[0]
      throw new Error("Asset id does not exist")
    } catch (e) {
      console.log("getAsset", e)
      throw e
    }
  }

  async getUserCreated(user: Principal) {
    const actor = await Bodhi.getNoIdentityActor()
    try {
      return await actor.getUserCreated(user) as Asset[]
    } catch (e) {
      console.log("getUserCreated", e)
      throw e
    }
  }

  async getUserBuyed(user: Principal): Promise<shareAsset[]> {
    const actor = await Bodhi.getNoIdentityActor()
    try {
      const res = await actor.getUserBuyed(user) as [Asset, bigint][]
      return res.map(v => {
        return {...v[0], share: Number(v[1])}
      })
    } catch (e) {
      console.log("getUserBuyed", e)
      throw e
    }
  }

}

export const bodhiApi = new Bodhi()
