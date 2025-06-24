import { Insertable, Updateable } from "kysely";
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

    async updateProject(id: number, updates: Updateable<DB["projects"]>) {

        const existingProject = await this.getProjectById(id);
        if (!existingProject) {
            throw new Error(`Project with id ${id} does not exist`);
        }
        
        // Check if status is being updated to 'Completed'
        if (updates.status === 'Completed' && existingProject.status !== 'Completed') {
            updates.completedAt = new Date();
        }
        
        // If status is changed from 'Completed' to something else, clear completedAt
        if (updates.status && updates.status !== 'Completed' && existingProject.status === 'Completed') {
            updates.completedAt = null;
        }

        await db.updateTable("projects")
                .set(updates)
                .where("id", "=", id)
                .executeTakeFirstOrThrow();

        return this.getProjectById(id);
    },

    async deleteProject(id: number) {

        const existingProject = await this.getProjectById(id);
        if (!existingProject) {
            throw new Error(`Project with id ${id} does not exist`);
        }

        await db.deleteFrom("projects").where('id', '=', id).executeTakeFirstOrThrow();
        return {msg: "Project deleted successfully"};
    },

    async getAllProjectsOfAUser (userId: number) {
        const allProjectsOfUser =  db.selectFrom('projects').selectAll().where('ownerId', '=', userId).execute();
        return allProjectsOfUser;
    }
}