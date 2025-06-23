import { Insertable, Updateable } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";
import { projectServices } from "./Project.service";
import { checkIsProjectMember, checkIsProjectOwner, checkProjectAccess } from "../utils/projectUtils";

export const taskServices = {
    async createTask(projectId: number, task: Omit<Insertable<DB['tasks']>, 'projectId' | 'ownerId'>, userId: number) {
        console.log("🚀 ~ createTask ~ projectId:", projectId)
        console.log("🚀 ~ createTask ~ task:", task)
        console.log("🚀 ~ createTask ~ userId:", userId)
        
        // Check if user has access to the project (either owner or member)
        const hasAccess = await checkProjectAccess(projectId, userId);
        if (!hasAccess) {
            throw new Error('User is not authorized to create tasks in this project');
        }

        const fullTask = { ...task, projectId, ownerId: userId }

        const newTask = await db.insertInto("tasks").values(fullTask).executeTakeFirstOrThrow();
        return db.selectFrom("tasks").selectAll().where('id', '=', Number(newTask.insertId)).executeTakeFirstOrThrow();
    },

    async getTaskById(taskId: number) {
        return db.selectFrom('tasks').selectAll().where('id', "=", taskId).executeTakeFirst();
    },

    // async deleteTask(taskId: number, userId: number) {
    async deleteTask(taskId: number) {
        const existingTask = await this.getTaskById(taskId);
        if (!existingTask) {
            throw new Error('Task does not exist');
        }

        // // Check if user is project owner
        // const isOwner = await checkIsProjectOwner(existingTask.projectId, userId);
        // if (!isOwner) {
        //     throw new Error('Only project owner can delete tasks');
        // }

        await db.deleteFrom("tasks").where('id', '=', taskId).executeTakeFirstOrThrow();
        return { msg: "task deleted successfully!!!" }
    },

    async updateTask(taskId: number, updates: Updateable<DB["tasks"]>, userId: number) {
        const existingTask = await this.getTaskById(taskId);
        if (!existingTask) {
            throw new Error('Task does not exist');
        };

        // Check if user has access to update the task
        const hasAccess = await checkProjectAccess(existingTask.projectId, userId);
        if (!hasAccess) {
            throw new Error('User is not authorized to update this task');
        }

        await db.updateTable("tasks").set(updates).where('id', '=', taskId).executeTakeFirstOrThrow();

        return this.getTaskById(taskId);
    },

    async getProjectTasks(projectId: number) {
        // this will fetch all tasks of a project
        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            throw new Error('Project does not exist');
        };

        const tasks = await db.selectFrom("tasks").selectAll().where('tasks.projectId', "=", projectId).execute();
        return tasks;
    },

    async getAllTasks() {
        const tasks = await db.selectFrom("tasks").selectAll().execute();
        return tasks;
    },

    async getUserTasks(userId: number) {
        return db.selectFrom('tasks').where('ownerId', '=', userId).selectAll().execute();
    },

}