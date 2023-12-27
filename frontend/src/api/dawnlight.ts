import {idlFactory} from "../declarations/Dawnlight_backend/Dawnlight_backend.did.js";
import {getActor} from "../utils/Actor";
import {Asset, Result, Result_1, TradeMetaData} from "../declarations/Dawnlight_backend/Dawnlight_backend";
import {Principal} from "@dfinity/principal";

const bodhi_cai = "g5r75-yaaaa-aaaan-qlgua-cai"

export type shareAsset = Asset & {
  share: number
}

class Drawnlight {
  private static async getActor() {
    return await getActor.createActor(idlFactory, bodhi_cai);
  }

  private static async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, bodhi_cai)
  }

  async create(fileKey: string): Promise<Principal> {
    const actor = await Drawnlight.getActor()
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

  async buy(assetId: bigint, amout: bigint): Promise<null> {
    const actor = await Drawnlight.getActor()
    try {
      const res = await actor.buy(assetId, amout) as Result
      if ("ok" in res) {
        return res.ok
      } else throw new Error(Object.keys(res.err)[0])
    } catch (e) {
      console.log("buy", e)
      throw e
    }
  }

  async getAssetsEntries(): Promise<Asset[]> {
    const actor = await Drawnlight.getActor()
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
    const actor = await Drawnlight.getActor()
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
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      return await actor.getUserCreated(user) as Asset[]
    } catch (e) {
      console.log("getUserCreated", e)
      throw e
    }
  }

  async getUserBuyed(user: Principal): Promise<shareAsset[]> {
    const actor = await Drawnlight.getNoIdentityActor()
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

  async getBuyPriceAfterFee(asstId: bigint, amount: bigint): Promise<bigint> {
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      const res = await actor.getBuyPriceAfterFee(asstId, amount) as bigint;
      return res
    } catch (e) {
      console.log("getBuyPriceAfterFee", e)
      throw e
    }
  }

  async getWicp(to: Principal) {
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      const res = await actor.getWicp(to) as Result
      console.log(res)
    } catch (e) {
      console.log("getWicp", e)
      throw e
    }
  }

  async getPoolValue(assetId: bigint): Promise<bigint> {
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      const res = await actor.getPoolValue(assetId) as bigint
      return res
    } catch (e) {
      console.log("getPoolValue", e)
      throw e
    }
  }

  async getRecentTrade(assetId: bigint) {
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      return await actor.getRecentTrade(assetId) as TradeMetaData[]
    } catch (e) {
      console.log("getRecentTrade", e)
      throw e
    }
  }

  async getHolders(assetId: bigint): Promise<Array<[Principal, bigint]>>{
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      const res = await actor.getHolders(assetId) as Array<[Principal, bigint]>
      return res
    } catch (e) {
      console.log("getHolders", e)
      throw e
    }
  }

  async getShareSupply(assetId: bigint) {
    const actor = await Drawnlight.getNoIdentityActor()
    try {
      const res = await actor.getShareSupply(assetId) as bigint
      return res
    } catch (e) {
      console.log("getShareSupply", e)
      throw e
    }
  }

}

export const drawnlightApi = new Drawnlight()
