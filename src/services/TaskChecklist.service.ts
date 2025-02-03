import { Insertable, Updateable, UpdateKeys } from "kysely";
import { DB } from "../utils/kysely-types";
import { db } from "../config/db";

export const taskChecklistServices = {
    async addTaskChecklistItem(taskId: number, item: string, userId: number) {

        const task = await db
        .selectFrom('tasks')
        .select('assignedUserId')
        .where('id', '=', taskId)
        .executeTakeFirstOrThrow();

        if (task.assignedUserId !== userId) {
        throw new Error('Only task owner can add checklist items');
        }

        const newChecklistItem = await db
            .insertInto("taskchecklists")
            .values({ taskId, item })
            .executeTakeFirstOrThrow();
        
        const result = await db.selectFrom('taskchecklists').selectAll().where('id', '=', Number(newChecklistItem.insertId)).executeTakeFirst();
        return result;
    },

    async getChecklistItemById (itemId: number) {
        const result = await db.selectFrom('taskchecklists').selectAll().where('id', '=', itemId).executeTakeFirstOrThrow();
        return result;
    },
    
    async removeChecklistItem(itemId: number) {
        const checklistItem = await this.getChecklistItemById(itemId);
        if(!checklistItem){
            throw new Error('Checklist item not found');
        }
        await db.deleteFrom('taskchecklists').where('id', '=', itemId).executeTakeFirstOrThrow();
        return { msg: "Checklist Item deelted successfully!!"}
    },

    async updateChecklistItem (checklistItemId: number, userId: number, updates: Updateable<DB['taskchecklists']>) {
        const checklistItem = await this.getChecklistItemById(checklistItemId);
        if(!checklistItem){
            throw new Error('Checklist item not found');
        }

        const task = await db
        .selectFrom('tasks')
        .select('assignedUserId')
        .where('id', '=', checklistItem.taskId)
        .executeTakeFirstOrThrow();

        if (task.assignedUserId !== userId) {
            throw new Error('Only task owner can update checklist items');
        }

        const result = await db
        .updateTable('taskchecklists')
        .set(updates)
        .where('id', '=', checklistItemId)
        .executeTakeFirstOrThrow();

        return result;
    },

    async getTaskChecklist(taskId: number) {
        return db
          .selectFrom('taskchecklists')
          .selectAll()
          .where('taskId', '=', taskId)
          .orderBy('createdAt', 'asc')
          .execute();
    },

};