import { db } from "../../config/db.js";
import { MyContext } from "../../types/context.js";
import { Project } from "../../types/project.types.js";
import { requireAuth } from "../../utils/auth.js";

export const projectResolvers = {
    Query: {
        projects: async (
            _: unknown,
            __: unknown,
            context: MyContext
        ): Promise<Project[]> => {
            requireAuth(context)
            const [rows] = await db.query("SELECT * FROM projects");
            // Map created_at to createdAt
            const projects = (rows as any[]).map(row => ({
                id: row.id,
                name: row.name,
                createdAt: row.created_at, // Map DB column to API field
            }));
            return projects;
        }
    },
}