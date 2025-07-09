import { sql, Updateable } from "kysely";
import { db } from "../config/db";
import { DB } from "../utils/kysely-types";

interface StopTimeLogData {
  projectId: number; // Required
  taskId: number; // Required
  name?: string;
  description?: string;
}

interface UpdateLogData {
  name?: string;
  description?: string;
  taskId?: number;
  projectId?: number;
  startTime?: Date;
  endTime?: Date;
}

export const logServices = {
  async startTimeLog(userId: number) {
    const startTime = new Date();

    const activeLog = await db
      .selectFrom("timelogs")
      .select("id")
      .where("userId", "=", userId)
      .where("endTime", "is", null)
      .executeTakeFirst();

    if (activeLog) {
      throw new Error("You have an active time log. Stop it first.");
    }

    const logEntry = await db
      .insertInto("timelogs")
      .values({
        userId,
        startTime: new Date(),
        timeSpent: 0,
        projectId: null, // Explicit null for nullable columns
        taskId: null,
      })
      .executeTakeFirstOrThrow();

    return db
      .selectFrom("timelogs")
      .selectAll()
      .where("id", "=", Number(logEntry.insertId))
      .executeTakeFirstOrThrow();
  },

  async stopTimeLog(userId: number, logId: number, data: StopTimeLogData) {
    const log = await db
      .selectFrom("timelogs")
      .selectAll()
      .where("id", "=", logId)
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow();

    if (log.endTime) {
      throw new Error("Time log already stopped");
      // return new Error('Time log already stopped');
    }

    const endTime = new Date();
    const timeSpent = Math.floor(
      (endTime.getTime() - new Date(log.startTime).getTime()) / 1000
    );

    // update the time logs
    await db
      .updateTable("timelogs")
      .set({
        ...data,
        endTime,
        timeSpent,
      })
      .where("id", "=", logId)
      .executeTakeFirstOrThrow();

    // also need to update the task table's total tiime field
    await db
      .updateTable("tasks")
      .set({ totalTimeSpent: sql`totalTimeSpent + ${timeSpent}` })
      .where("id", "=", data.taskId)
      .execute();

    // projects table ko bhi update krna padega
    await db
      .updateTable("projects")
      .set({
        totalHours: sql`totalHours + ${timeSpent / 3600}`,
      })
      .where("id", "=", data.projectId)
      .execute();

    const updatedLog = await db
      .selectFrom("timelogs")
      .selectAll()
      .where("id", "=", logId)
      .executeTakeFirstOrThrow();

    return updatedLog;
  },

  async getLogById(logId: number) {
    // const log = await db.selectFrom('timelogs').selectAll().where('id', '=', logId).executeTakeFirst();
    const log = await db
      .selectFrom('timelogs')
      .leftJoin('users', 'users.id', 'timelogs.userId')
      .leftJoin('projects', 'projects.id', 'timelogs.projectId')
      .leftJoin('tasks', 'tasks.id', 'timelogs.taskId')
      .select([
        'timelogs.id',
        'timelogs.name',
        'timelogs.description',
        'timelogs.startTime',
        'timelogs.endTime',
        'timelogs.timeSpent',
        'timelogs.createdAt',
        'timelogs.projectId',
        'timelogs.taskId',
        'timelogs.userId',
        'users.name as userName',
        'users.email as userEmail',
        'projects.name as projectName',
        'tasks.subject as taskName'
      ])
      .where('timelogs.id', '=', logId)
      .executeTakeFirst();
    return log;
  },

  async getUserLogs(userId: number) {
    // const userLogs = await db.selectFrom('timelogs').selectAll().where('timelogs.userId', '=', userId).execute();
    const userLogs = await db
      .selectFrom('timelogs')
      .leftJoin('users', 'users.id', 'timelogs.userId')
      .leftJoin('projects', 'projects.id', 'timelogs.projectId')
      .leftJoin('tasks', 'tasks.id', 'timelogs.taskId')
      .select([
        'timelogs.id',
        'timelogs.name',
        'timelogs.description',
        'timelogs.startTime',
        'timelogs.endTime',
        'timelogs.timeSpent',
        'timelogs.createdAt',
        'timelogs.projectId',
        'timelogs.taskId',
        'timelogs.userId',
        'users.name as userName',
        'users.email as userEmail',
        'projects.name as projectName',
        'tasks.subject as taskName'
      ])
      .where('timelogs.userId', '=', userId)
      .orderBy('timelogs.startTime', 'desc')
      .execute();
    return userLogs;
  },

  async getProjectLogs(projectId: number) {
    const projectLogs = await db
      .selectFrom('timelogs')
      .leftJoin('users', 'users.id', 'timelogs.userId')
      .leftJoin('projects', 'projects.id', 'timelogs.projectId')
      .leftJoin('tasks', 'tasks.id', 'timelogs.taskId')
      .select([
        'timelogs.id',
        'timelogs.name',
        'timelogs.description',
        'timelogs.startTime',
        'timelogs.endTime',
        'timelogs.timeSpent',
        'timelogs.createdAt',
        'timelogs.projectId',
        'timelogs.taskId',
        'timelogs.userId',
        'users.name as userName',
        'users.email as userEmail',
        'projects.name as projectName',
        'tasks.subject as taskName'
      ])
      .where('timelogs.projectId', '=', projectId)
      .orderBy('timelogs.startTime', 'desc')
      .execute();
    return projectLogs;
  },

  async getTaskLogs(taskId: number) {
    const taskLogs = await db
      .selectFrom('timelogs')
      .leftJoin('users', 'users.id', 'timelogs.userId')
      .leftJoin('projects', 'projects.id', 'timelogs.projectId')
      .leftJoin('tasks', 'tasks.id', 'timelogs.taskId')
      .select([
        'timelogs.id',
        'timelogs.name',
        'timelogs.description',
        'timelogs.startTime',
        'timelogs.endTime',
        'timelogs.timeSpent',
        'timelogs.createdAt',
        'timelogs.projectId',
        'timelogs.taskId',
        'timelogs.userId',
        'users.name as userName',
        'users.email as userEmail',
        'projects.name as projectName',
        'tasks.subject as taskName'
      ])
      .where('timelogs.taskId', '=', taskId)
      .orderBy('timelogs.startTime', 'desc')
      .execute();
    return taskLogs;
  },

  async deleteLog(logId: number) {
    
    const log = await this.getLogById(logId);
    if (!log) {
      throw new Error('Log not found');
    }

    // deleted log from timelogs table
    await db.deleteFrom('timelogs').where('id', '=', logId).execute();

    // aab subtract krke updated krna task table and project table ko
    if(log.timeSpent > 0){
      await db.updateTable('tasks').set({totalTimeSpent: sql` totalTimeSpent - ${log.timeSpent}`}).where('id', '=', log.taskId).execute();

      await db.updateTable('projects').set({totalHours: sql`totalHours - ${log.timeSpent / 3600}`}).where('id', '=', log.projectId).execute();
    }
    return true; 
  },

  async updateLog(logId: number, userId: number, updates: UpdateLogData) {
    const log = await this.getLogById(logId);
    if (!log) {
      throw new Error('Log not found');
    }
    const newStart = updates.startTime || log.startTime;
    const newEnd = updates.endTime || (log.endTime ?? new Date());
    const timeSpent = Math.floor((newEnd.getTime() - newStart.getTime()) / 1000);

    const oldTaskId = log.taskId;
    const oldProjectId = log.projectId;
    const newTaskId = updates.taskId || log.taskId;
    const newProjectId = updates.projectId || log.projectId;

    await db
    .updateTable('timelogs')
    .set({
      ...updates,
      timeSpent
    })
    .where('id', '=', logId)
    .execute();

  // Handle task/project time updates
    if (oldTaskId !== newTaskId || oldProjectId !== newProjectId) {
      // Remove time from old task/project
      if (oldTaskId) {
        await db
          .updateTable('tasks')
          .set({totalTimeSpent:  sql`totalTimeSpent - ${log.timeSpent}`})
          .where('id', '=', oldTaskId)
          .execute();
      }

      if (oldProjectId) {
        await db
          .updateTable('projects')
          .set({totalHours: sql`totalHours - ${log.timeSpent / 3600}`})
          .where('id', '=', oldProjectId)
          .execute();
      }

      // Add time to new task/project
      await db
        .updateTable('tasks')
        .set({totalTimeSpent:sql`totalTimeSpent + ${timeSpent}`})
        .where('id', '=', newTaskId)
        .execute();

      await db
        .updateTable('projects')
        .set({totalHours: sql`totalHours + ${timeSpent / 3600}`})
        .where('id', '=', newProjectId)
        .execute();
    } else {
      // Adjust time for same task/project
      const timeDifference = timeSpent - log.timeSpent;

      if (timeDifference !== 0) {
        await db
          .updateTable('tasks')
          .set({totalTimeSpent: sql`totalTimeSpent + ${timeDifference}`})
          .where('id', '=', newTaskId)
          .execute();

        await db
          .updateTable('projects')
          .set({totalHours: sql`totalHours + ${timeDifference / 3600}`})
          .where('id', '=', newProjectId)
          .execute();
      }
    }
    return this.getLogById(logId)
  },

  async getTotalTimeSpentToday(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .selectFrom('timelogs')
      .select(({ fn }) => [
        fn.sum('timeSpent').as('totalTimeSpent')
      ])
      .where('userId', '=', userId)
      .where('startTime', '>=', today)
      .where('startTime', '<', tomorrow)
      .executeTakeFirst();

    return {
      totalTimeSpent: Number(result?.totalTimeSpent || 0),
      formattedTime: this.formatTimeSpent(Number(result?.totalTimeSpent || 0))
    };
  },

  async getWeeklySummary(userId: number) {
    // Get the start and end of the current week (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Query: sum timeSpent for each day in the week for this user
    const results = await db
      .selectFrom('timelogs')
      .select([
        sql`DATE(startTime)`.
          as('date'),
        sql`SUM(timeSpent)`.
          as('totalTime')
      ])
      .where('userId', '=', userId)
      .where('startTime', '>=', monday)
      .where('startTime', '<=', sunday)
      .groupBy(sql`DATE(startTime)`)
      .orderBy(sql`DATE(startTime)`)
      .execute();

      console.log("🚀 ~ getWeeklySummary ~ results:", results)
    // Fill in missing days with totalTime: 0
    const summary = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const found = results.find(r => String(r.date).slice(0, 10) === dateStr);
      summary.push({
        date: dateStr,
        totalTime: found ? Number(found.totalTime) : 0
      });
    }
        console.log("🚀 ~ getWeeklySummary ~ summary:", summary)
    return summary;
  },

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
};
