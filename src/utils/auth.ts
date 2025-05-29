import { MyContext } from "../types/context.js";

export function requireAuth(context: MyContext) {
  if (!context.user) {
    console.log(context.user);
    throw new Error("Not authenticated");
  }
}