import { Insertable, NO_MIGRATIONS } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";

export const projectServices = {

    async createProject(project: Insertable<DB["projects"]>) {

        const existingProject = await db.selectFrom('projects')
                                        .where("name", "=", project.name)
                                        .select("name")
                                        .executeTakeFirst();

        if (existingProject?.name === project.name) {
            throw new Error(`Project with name ${project.name} already exists`);
        }

        const result = await db.insertInto('projects').values(project).executeTakeFirstOrThrow();

        return db.selectFrom("projects").selectAll().where('id', '=', Number(result.insertId)).executeTakeFirstOrThrow();
    },

    async getProjectById(id: number) {
        const result = await db.selectFrom("projects").selectAll().where('id', '=', id).executeTakeFirst();
        return result;
    },

    async updateProject(id: number, updates: Partial<DB["projects"]>) {}
}