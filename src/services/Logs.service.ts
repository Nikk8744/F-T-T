
import { sql, Updateable } from "kysely";
import { db } from "../config/db";
import { DB } from "../utils/kysely-types";

interface StopTimeLogData {
    projectId: number; // Required
    taskId: number;    // Required
    name?: string;
    description?: string;
  }

export const logServices = {
    async startTimeLog (userId: number) {

        const startTime = new Date();

        const activeLog = await db
        .selectFrom('timelogs')
        .select('id')
        .where('userId', '=', userId)
        .where('endTime', 'is', null)
        .executeTakeFirst();

        if (activeLog) {
            throw new Error('You have an active time log. Stop it first.');
        }

        const logEntry =  await db.insertInto('timelogs').values({
            userId,
            startTime: new Date(),
            timeSpent: 0,
            projectId: null, // Explicit null for nullable columns
            taskId: null 
          })
          .executeTakeFirstOrThrow();
        
          return db.selectFrom("timelogs").selectAll().where('id', '=', Number(logEntry.insertId)).executeTakeFirstOrThrow();
          
    },

    async stopTimeLog (userId: number, logId: number, data: StopTimeLogData ) {

        const log = await db
        .selectFrom('timelogs')
        .selectAll()
        .where('id', '=', logId)
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow();

      if (log.endTime) {
        throw new Error('Time log already stopped');
      }

      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - new Date(log.startTime).getTime()) / 1000);

       db.updateTable("timelogs").set({
        ...data,
        endTime,
        timeSpent
      })
      .where('id', '=', logId)
      .executeTakeFirstOrThrow();

      // also need to update the task total tiime field
      await db.updateTable("tasks").set({ totalTimeSpent: sql`totalTimeSpent + ${timeSpent}` }).where('id', '=', log.taskId).execute();
      // projects
      await db.updateTable('projects').set({
        totalHours: sql`totalHours + ${timeSpent / 3600}`
      }).where("id", "=", data.projectId)
      .execute();

      const updatedLog = await db
      .selectFrom('timelogs')
      .selectAll()
      .where('id', '=', logId)
      .executeTakeFirstOrThrow();

      return updatedLog;
    },
}