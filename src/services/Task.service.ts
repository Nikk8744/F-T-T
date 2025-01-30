import { Insertable } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";

export const taskServices = {
    async createTask (projectId: number,task: Omit<Insertable<DB['tasks']>, 'projectId' | 'assignedUserId'>, userId: number) {
        const isUserAMember = await db
            .selectFrom("projectMembers")  
            .where("projectId", "=", projectId)
            .where("userId", "=", userId)
            .select("projectId")
            .executeTakeFirst()
        
        if (!isUserAMember) {
            throw new Error('User is not a project member');
        }

        const fullTask = {...task, projectId, assignedUserId: userId}

        const newTask = await db.insertInto("tasks").values(fullTask).executeTakeFirstOrThrow();
        return db.selectFrom("tasks").selectAll().where('id', '=', Number(newTask.insertId)).executeTakeFirstOrThrow();
    },

    async getTaskById (taskId: number) {
        return db.selectFrom('tasks').selectAll().where('id', "=", taskId).executeTakeFirst();
    },

    async deleteTask () {},
}