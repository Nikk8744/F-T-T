import { Insertable, Updateable } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";
import { projectServices } from "./Project.service";
import { checkIsProjectMember, checkIsProjectOwner, checkProjectAccess } from "../utils/projectUtils";
import { taskChecklistServices } from "./TaskChecklist.service";

export const taskServices = {
    async createTask(projectId: number, task: Omit<Insertable<DB['tasks']>, 'projectId' | 'ownerId'> & { checklistItems?: (string | { item: string, isCompleted?: boolean })[] }, userId: number) {
        console.log("🚀 ~ createTask ~ projectId:", projectId)
        console.log("🚀 ~ createTask ~ task:", task)
        console.log("🚀 ~ createTask ~ userId:", userId)
        
        // Check if user has access to the project (either owner or member)
        const hasAccess = await checkProjectAccess(projectId, userId);
        if (!hasAccess) {
            throw new Error('User is not authorized to create tasks in this project');
        }

        // Extract checklist items before creating the task
        const { checklistItems, ...taskData } = task;
        
        // Create the task
        const fullTask = { ...taskData, projectId, ownerId: userId };
        
        // Use a transaction to ensure all operations succeed or fail together
        return await db.transaction().execute(async (trx) => {
            // Create the task
            const newTask = await trx.insertInto("tasks")
                .values(fullTask)
                .executeTakeFirstOrThrow();
                
            const taskId = Number(newTask.insertId);
            
            // Create checklist items if provided
            if (checklistItems && checklistItems.length > 0) {
                for (const item of checklistItems) {
                    // Handle both string and object formats
                    if (typeof item === 'string') {
                        // If item is a string, create with default isCompleted=false
                        await trx.insertInto("taskchecklists")
                            .values({
                                taskId,
                                item: item,
                                isCompleted: false
                            })
                            .execute();
                    } else {
                        // If item is an object, use its properties
                        await trx.insertInto("taskchecklists")
                            .values({
                                taskId,
                                item: item.item,
                                isCompleted: item.isCompleted || false
                            })
                            .execute();
                    }
                }
            }
            
            // Return the complete task with its data
            return trx.selectFrom("tasks")
                .selectAll()
                .where('id', '=', taskId)
                .executeTakeFirstOrThrow();
        });
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
        
        // Check if status is being updated to 'Done'
        if (updates.status === 'Done' && existingTask.status !== 'Done') {
            updates.completedAt = new Date();
        }
        
        // If status is changed from 'Done' to something else, clear completedAt
        if (updates.status && updates.status !== 'Done' && existingTask.status === 'Done') {
            updates.completedAt = null;
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