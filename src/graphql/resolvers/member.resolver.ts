import { db } from "../../config/db.js";
import { MyContext } from "../../types/context.js";
import { Member } from "../../types/member.types.js";
import { requireAuth } from "../../utils/auth.js";

export const memberResolvers = {
    Query:{
        members: async (
            _: unknown,
            __: unknown,
            context : MyContext
        ) : Promise<Member[]> => {
            requireAuth(context);
            const [rows] = await db.query("SELECT * FROM members");
            const members = rows as Member[];
            return members;
        }
    }

}