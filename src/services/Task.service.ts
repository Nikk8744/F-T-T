import { Insertable, Updateable } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";
import { projectServices } from "./Project.service";
import { checkIsProjectMember, checkIsProjectOwner, checkProjectAccess } from "../utils/projectUtils";
import { TaskStatus } from "../types";

interface CreateTaskParams {
    projectId: number;
    task: Omit<Insertable<DB['tasks']>, 'projectId' | 'ownerId'> & { checklistItems?: (string | { item: string, isCompleted?: boolean })[] };
    userId: number;
}

export const taskServices = {
    async createTask({ projectId, task, userId }: CreateTaskParams) {
        
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
        // We'll use the separate query approach since it works reliably
        const result = await db.selectFrom('tasks')
        .leftJoin('users', 'users.id', 'tasks.ownerId')
        .select([
            'tasks.id as id',
            'tasks.subject as subject',
            'tasks.description as description',
            'tasks.status as status',
            'tasks.priority as priority',
            'tasks.dueDate as dueDate',
            'tasks.projectId as projectId',
            'tasks.ownerId as ownerId',
            'tasks.createdAt as createdAt',
            'tasks.updatedAt as updatedAt',
            'tasks.completedAt as completedAt',
            'tasks.totalTimeSpent as totalTimeSpent',
            'users.name as ownerName',
            'users.email as ownerEmail'
        ])
        .where('tasks.id', "=", taskId)
        .executeTakeFirst();
        
        return result;
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
        if (updates.status === TaskStatus.DONE && existingTask.status !== TaskStatus.DONE) {
            updates.completedAt = new Date();
        }
        
        // If status is changed from 'Done' to something else, clear completedAt
        if (updates.status && updates.status !== TaskStatus.DONE && existingTask.status === TaskStatus.DONE) {
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
        // if (tasks.length === 0) {
            //     return [];
        // }
        
        // // Extract unique owner IDs
        // const ownerIds = [...new Set(tasks.map(task => task.ownerId))];
        
        // // Fetch all owners in a single query
        // const owners = await db.selectFrom('users')
        //     .where('id', 'in', ownerIds)
        //     .select(['id', 'name', 'email'])
        //     .execute();
            
        // // Create a map of owner details by ID for quick lookup
        // const ownerMap = new Map();
        // owners.forEach(owner => {
        //     ownerMap.set(owner.id, {
        //         ownerName: owner.name,
        //         ownerEmail: owner.email
        //     });
        // });
        
        // // Combine tasks with their owner details
        // const tasksWithOwnerDetails = tasks.map(task => {
        //     const ownerDetails = ownerMap.get(task.ownerId) || { ownerName: null, ownerEmail: null };
        //     return {
        //         ...task,
        //         ...ownerDetails
        //     };
        // });
        
        // return tasksWithOwnerDetails;
        return tasks;
    },

    async getAllTasks() {
        const tasks = await db.selectFrom("tasks").selectAll().execute();
        return tasks;
            // if (tasks.length === 0) {
            //     return [];
            // }
            
            // // Extract unique owner IDs
            // const ownerIds = [...new Set(tasks.map(task => task.ownerId))];
            
            // // Fetch all owners in a single query
            // const owners = await db.selectFrom('users')
            //     .where('id', 'in', ownerIds)
            //     .select(['id', 'name', 'email'])
            //     .execute();
                
            // // Create a map of owner details by ID for quick lookup
            // const ownerMap = new Map();
            // owners.forEach(owner => {
            //     ownerMap.set(owner.id, {
            //         ownerName: owner.name,
            //         ownerEmail: owner.email
            //     });
            // });
            
            // // Combine tasks with their owner details
            // const tasksWithOwnerDetails = tasks.map(task => {
            //     const ownerDetails = ownerMap.get(task.ownerId) || { ownerName: null, ownerEmail: null };
            //     return {
            //         ...task,
            //         ...ownerDetails
            //     };
            // });
            
            // return tasksWithOwnerDetails;
    },

    async getUserTasks(userId: number) {
        return db.selectFrom('tasks').where('ownerId', '=', userId).selectAll().execute();
        // const tasks = await db.selectFrom('tasks').where('ownerId', '=', userId).selectAll().execute();
        
        // if (tasks.length === 0) {
        //     return [];
        // }
        
        // // For user tasks, we know all tasks have the same owner (the user)
        // // So we can just fetch the owner details once
        // const owner = await db.selectFrom('users')
        //     .where('id', '=', userId)
        //     .select(['name', 'email'])
        //     .executeTakeFirst();
            
        // // Combine tasks with owner details
        // const tasksWithOwnerDetails = tasks.map(task => {
        //     return {
        //         ...task,
        //         ownerName: owner?.name,
        //         ownerEmail: owner?.email
        //     };
        // });
        
        // return tasksWithOwnerDetails;
    },

}