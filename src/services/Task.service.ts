import { Insertable, Updateable } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";
import { projectServices } from "./Project.service";

export const taskServices = {
    async createTask (projectId: number,task: Omit<Insertable<DB['tasks']>, 'projectId' | 'assignedUserId'>, userId: number) {
        const isUserAMember = await db
            .selectFrom("projectmembers")  
            .where("projectId", "=", projectId)
            .where("userId", "=", userId)
            .select("projectId")
            .executeTakeFirst()
        
        
        const isUserOwner = await db
        .selectFrom("projects")
        .where("id", "=", projectId)
        .where("projects.userId", "=", userId)
        .select("id")
        .executeTakeFirst();


        if (!isUserAMember && !isUserOwner) {
            throw new Error('User is not a project member');
        }

        const fullTask = {...task, projectId, assignedUserId: userId}

        const newTask = await db.insertInto("tasks").values(fullTask).executeTakeFirstOrThrow();
        return db.selectFrom("tasks").selectAll().where('id', '=', Number(newTask.insertId)).executeTakeFirstOrThrow();
    },

    async getTaskById (taskId: number) {
        return db.selectFrom('tasks').selectAll().where('id', "=", taskId).executeTakeFirst();
    },

    async deleteTask (taskId: number) {
        const existingTask = await this.getTaskById(taskId);
        if(!existingTask){
            throw new Error('Task does not exist');
        }

        await db.deleteFrom("tasks").where('id', '=', taskId).executeTakeFirstOrThrow();
        return { msg: "task deleted successfully!!!"}
    },

    async updateTask (taskId: number, updates: Updateable<DB["tasks"]>){
        const existingTask = await this.getTaskById(taskId);
        if(!existingTask){
            throw new Error('Task does not exist');
        };

        await db.updateTable("tasks").set(updates).where('id', '=', taskId).executeTakeFirstOrThrow();

        return this.getTaskById(taskId);
    },

    async getProjectTasks (projectId: number) {
        // this will fetch all tasks of a project
        const project = await projectServices.getProjectById(projectId);
        if(!project){
            throw new Error('Project does not exist');
        };
        
        const tasks =  await db.selectFrom("tasks").selectAll().where('tasks.projectId', "=", projectId).execute();
        return tasks;
    },

    async getAllTasks (){
        const tasks = await db.selectFrom("tasks").selectAll().execute();
        return tasks;
    },

    async getUserTasks (userId: number) {
        return db.selectFrom('tasks').where('assignedUserId', '=', userId).selectAll().execute();
    },

}