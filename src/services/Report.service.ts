import { sql } from "kysely";
import { db } from "../config/db";

export const ReportService = {

  // Project Report Functions

  async verifyProjectAccess(projectId: number, userId: number) {
    console.log("🚀 ~ verifyProjectAccess ~ projectId:", projectId)
    console.log("🚀 ~ verifyProjectAccess ~ userId:", userId)
    const projectAccess = await db
      .selectFrom("projects")
      .innerJoin("projectmembers", "projectmembers.projectId", "projects.id")
      // .where("projects.id", "=", projectId)
      .where((eb) => eb.or([
        eb("projectmembers.userId", "=", userId),
        eb("projects.ownerId", "=", userId)
      ]))
      .select(["projects.id", "projects.ownerId"])
      .executeTakeFirst();

    console.log("🚀 ~ verifyProjectAccess ~ projectAccess:", projectAccess)
    return !!projectAccess;
  },

  async getProjectSummary(projectId: number, userId: number) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error("You don't have access to this project");
    }

    const project = await db
      .selectFrom("projects")
      .selectAll()
      .where("id", "=", projectId)
      .executeTakeFirstOrThrow();

    const taskStats = await db
      .selectFrom("tasks")
      .select([
        "status",
        sql<number>`COUNT(DISTINCT projectId)`.as("count")
      ])
      .where("projectId", "=", projectId)
      .groupBy("status")
      .execute();

    const totalTasks = taskStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedTasks = taskStats.find(stat => stat.status === "Done")?.count || 0;
    const completionPercentage = totalTasks > 0
      ? Math.round((Number(completedTasks) / totalTasks) * 100)
      : 0;

    // Get members count
    const membersCount = await db
      .selectFrom("projectmembers")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("projectId", "=", projectId)
      .executeTakeFirstOrThrow();

    return {
      project,
      taskStats,
      completionPercentage,
      membersCount: Number(membersCount.count),
      totalTasks
    };
  },

  async getProjectTeamAllocation(projectId: number, userId: number) {
    // Verify user has access to this project
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied to project");
    }

    // Get all project members
    const members = await db
      .selectFrom("projectmembers")
      .innerJoin("users", "users.id", "projectmembers.userId")
      .select(["projectmembers.userId", "users.userName", "users.email", "users.role"])
      .where("projectmembers.projectId", "=", projectId)
      .execute();

    // Get task assignments per member
    const teamWorkload = [];

    for (const member of members) {
      const totalAssigned = await db
        .selectFrom("task_assignments as ta")
        .innerJoin("tasks as t", "t.id", "ta.taskId")
        .select((eb) => eb.fn.countAll().as("total"))
        .where("ta.userId", "=", member.userId)
        .where("t.projectId", "=", projectId)
        .executeTakeFirstOrThrow();

      // Get count of completed tasks separately
      const completedTasks = await db
        .selectFrom("task_assignments as ta")
        .innerJoin("tasks as t", "t.id", "ta.taskId")
        .select((eb) => eb.fn.countAll().as("completed"))
        .where("ta.userId", "=", member.userId)
        .where("t.projectId", "=", projectId)
        .where("t.status", "=", "Done")
        .executeTakeFirstOrThrow();

      teamWorkload.push({
        ...member,
        taskCount: Number(totalAssigned.total),
        completedCount: Number(completedTasks.completed)
      });
    }

    return teamWorkload;
  },


  async getProjectRiskAssessment(projectId: number, userId: number) {
    // Verify user has access to this project
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied to project");
    }

    const now = new Date();

    // Get overdue tasks
    const overdueTasks = await db
      .selectFrom("tasks")
      .select(["id", "subject", "dueDate", "status", "ownerId"])
      .where("projectId", "=", projectId)
      .where("dueDate", "<", now)
      .where("status", "!=", "Done")
      .orderBy("dueDate", "asc")
      .execute();

    // Get approaching deadlines (tasks due in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const approachingDeadlines = await db
      .selectFrom("tasks")
      .select(["id", "subject", "dueDate", "status", "ownerId"])
      .where("projectId", "=", projectId)
      .where("dueDate", ">=", now)
      .where("dueDate", "<=", nextWeek)
      .where("status", "!=", "Done")
      .orderBy("dueDate", "asc")
      .execute();

    return {
      overdueTasks,
      approachingDeadlines,
      overdueCount: overdueTasks.length,
      approachingCount: approachingDeadlines.length
    };
  },

  async getProjectTaskBreakdown(projectId: number, userId: number) {
    // Verify user has access to this project
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied to project");
    }

    // Get tasks by status
    const tasksByStatus = await db
      .selectFrom("tasks")
      .select([
        "status",
        (eb) => eb.fn.count<number>("id").as("count")
      ])
      .where("projectId", "=", projectId)
      .groupBy("status")
      .execute();

    // Get tasks by priority
    // const tasksByPriority = await db
    //   .selectFrom("tasks")
    //   .select([
    //     "priority",
    //     (eb) => eb.fn.count<number>("id").as("count")
    //   ])
    //   .where("projectId", "=", projectId)
    //   .groupBy("priority")
    //   .execute();

    return {
      tasksByStatus,
      // tasksByPriority
    };
  },

  async getProjectTimeline(projectId: number, userId: number) {
    // Verify user has access to this project
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error("Access denied to project");
    }

    const project = await db
      .selectFrom("projects")
      .select(["id", "name", "startDate", "endDate", "status"])
      .where("id", "=", projectId)
      .executeTakeFirstOrThrow();

    // Get upcoming milestones (tasks with due dates)
    const upcomingTasks = await db
      .selectFrom("tasks")
      .select(["id", "subject", "dueDate", "status"])
      .where("projectId", "=", projectId)
      .where("dueDate", "is not", null)
      .orderBy("dueDate", "asc")
      .limit(10)
      .execute();

    // Calculate days remaining
    const now = new Date();
    let daysRemaining = null;
    let daysOverdue = null;

    if (project.endDate) {
      const endDate = new Date(project.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        daysRemaining = diffDays;
      } else {
        daysOverdue = Math.abs(diffDays);
      }
    }

    return {
      project,
      upcomingTasks,
      daysRemaining,
      daysOverdue
    };
  },

  // Task Report Methods
  async getTaskStatusDistribution(userId: number, projectId?: number) {
    // Base query for tasks
    let query = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.status",
        (eb) => eb.fn.count<number>("t.id").as("count")
      ])
      .where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]))
      .groupBy("t.status");

    // Add project filter if provided
    if (projectId) {
      const hasAccess = await this.verifyProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
      query = query.where("t.projectId", "=", projectId);
    }

    const result = await query.execute();

    return result;
  },


  async getOverdueTasks(userId: number, projectId?: number) {
    const now = new Date();

    // Base query for overdue tasks
    let query = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .leftJoin("projects as p", "p.id", "t.projectId")
      .select([
        "t.id",
        "t.subject",
        "t.dueDate",
        "t.status",
        // "t.priority",
        "p.name as projectName",
        "p.id as projectId"
      ])
      .where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]))
      .where("t.dueDate", "<", now)
      .where("t.status", "!=", "Done")
      .orderBy("t.dueDate", "asc");

    // Add project filter if provided
    if (projectId) {
      const hasAccess = await this.verifyProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
      query = query.where("t.projectId", "=", projectId);
    }

    const overdueTasks = await query.execute();

    // Calculate days overdue for each task
    return overdueTasks.map(task => {
      const dueDate = new Date(task?.dueDate || now);
      const diffTime = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...task,
        daysOverdue
      };
    });
  },

  //   async getTaskPriorityAnalysis(userId: number, projectId?: number) {
  //   // Base query for tasks by priority
  //   let query = db
  //     .selectFrom("tasks as t")
  //     .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
  //     .select([
  //       "t.priority",
  //       "t.status",
  //       (eb) => eb.fn.count<number>("t.id").as("count")
  //     ])
  //     .where(eb => eb.or([
  //       eb("t.ownerId", "=", userId),
  //       eb("ta.userId", "=", userId)
  //     ]))
  //     .groupBy(["t.priority", "t.status"]);

  //   // Add project filter if provided
  //   if (projectId) {
  //     const hasAccess = await this.verifyProjectAccess(projectId, userId);
  //     if (!hasAccess) {
  //       throw new Error("Access denied to project");
  //     }
  //     query = query.where("t.projectId", "=", projectId);
  //   }

  //   const result = await query.execute();

  //   // Transform to better structure for reporting
  //   const priorityMap: Record<string, { total: number, completed: number }> = {};

  //   result.forEach(item => {
  //     const priority = item.priority || 'Unset';

  //     if (!priorityMap[priority]) {
  //       priorityMap[priority] = { total: 0, completed: 0 };
  //     }

  //     priorityMap[priority].total += Number(item.count);
  //     if (item.status === 'Done') {
  //       priorityMap[priority].completed += Number(item.count);
  //     }
  //   });

  //   return Object.entries(priorityMap).map(([priority, stats]) => ({
  //     priority,
  //     ...stats,
  //     completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  //   }));
  // },


  async getTaskCompletionTrend(userId: number, days: number = 30, projectId?: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Base query for completed tasks within date range
    let query = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.updatedAt",
        "t.id"
      ])
      .where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]))
      .where("t.status", "=", "Done")
      .where("t.updatedAt", ">=", startDate)
      .where("t.updatedAt", "<=", endDate)
      // .groupBy((eb) => eb.fn("DATE(t.updatedAt)"))
      .orderBy("t.updatedAt", "asc");

    // Add project filter if provided
    if (projectId) {
      const hasAccess = await this.verifyProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
      query = query.where("t.projectId", "=", projectId);
    }

    const taskData = await query.execute();

    // Fill in missing dates with zero counts
    const dateMap = new Map();

    // First populate with data we have
    taskData.forEach(task => {
      const date = new Date(task.updatedAt);
      const dateStr = date.toISOString().split('T')[0];

      const currentCount = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, currentCount + 1); // Increment count for this date  
    });

    const trend = [];
    // Fill in missing dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      trend.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      });
    }
    return trend;
  }

}


