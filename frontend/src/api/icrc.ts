import {idlFactory} from "../declarations/icrc_token/icrc_token.did.js";
import {
    Account__1, Balance__1,
    TransferArgs, TransferResult
} from "../declarations/icrc_token/icrc_token";
import {getActor} from "../utils/Actor";
import {Principal} from "@dfinity/principal";
import { IDL } from "@dfinity/candid";

class ICRC {
    static canister: string;
    constructor(canister: string) {
        ICRC.canister = canister;
    }

    private static async getActor() {
        return await getActor.createActor(idlFactory, ICRC.canister);
    }
    
      private static async getNoIdentityActor() {
        return await getActor.noIdentityActor(idlFactory, ICRC.canister)
    }

    async icrc1_balance_of(account: Account__1): Promise<bigint> {
        const actor = await ICRC.getActor();
        try {
            const res = await actor.icrc1_balance_of(account) as Balance__1
            return res
        } catch(e) {
            console.log("icrc1_balance_of : ", e)
            throw e
        }
    }

    async icrc1_transfer(args: TransferArgs): Promise<TransferResult> {
        const actor = await ICRC.getActor();
        try {
            const res = await actor.icrc1_transfer(args) as TransferResult
            return res
        } catch(e) {
            console.error("icrc1_transfer : ", e)
            throw e
        }
    }
}

export const icrcApi = (canister: string) => new ICRC(canister)