import { sql } from "kysely";
import { db } from "../config/db";
import { projectServices } from "./Project.service";
import { checkIsProjectOwner, checkProjectAccess } from "../utils/projectUtils";

export const ReportService = {

  // Project Report Functions

  async verifyProjectAccess(projectId: number, userId: number) {
    return checkProjectAccess(projectId, userId);
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

    // Get completed tasks with completedAt date
    const completedTasksWithDate = await db
      .selectFrom("tasks")
      .select(["id", "subject", "completedAt"])
      .where("projectId", "=", projectId)
      .where("status", "=", "Done")
      .where("completedAt", "is not", null)
      .orderBy("completedAt", "desc")
      .limit(5)
      .execute();

    return {
      project,
      taskStats,
      completionPercentage,
      membersCount: Number(membersCount.count),
      totalTasks,
      recentlyCompleted: completedTasksWithDate
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
      .select(["id", "subject", "dueDate", "status", "ownerId", "priority", "completedAt"])
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
      .select(["id", "subject", "dueDate", "status", "ownerId", "priority"])
      .where("projectId", "=", projectId)
      .where("dueDate", ">=", now)
      .where("dueDate", "<=", nextWeek)
      .where("status", "!=", "Done")
      .orderBy("dueDate", "asc")
      .execute();

    // Get high priority tasks
    const highPriorityTasks = await db
      .selectFrom("tasks")
      .select(["id", "subject", "dueDate", "status", "ownerId", "priority", "completedAt"])
      .where("projectId", "=", projectId)
      .where("priority", "in", ["High", "Urgent"])
      .where("status", "!=", "Done")
      .orderBy("priority", "desc")
      .orderBy("dueDate", "asc")
      .execute();

    return {
      overdueTasks,
      approachingDeadlines,
      highPriorityTasks,
      overdueCount: overdueTasks.length,
      approachingCount: approachingDeadlines.length,
      highPriorityCount: highPriorityTasks.length
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
    const tasksByPriority = await db
      .selectFrom("tasks")
      .select([
        "priority",
        (eb) => eb.fn.count<number>("id").as("count")
      ])
      .where("projectId", "=", projectId)
      .groupBy("priority")
      .execute();

    return {
      tasksByStatus,
      tasksByPriority
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
      .select(["id", "name", "startDate", "endDate", "status", "completedAt"])
      .where("id", "=", projectId)
      .executeTakeFirstOrThrow();

    // Get upcoming milestones (tasks with due dates)
    const upcomingTasks = await db
      .selectFrom("tasks")
      .select(["id", "subject", "dueDate", "status", "priority", "completedAt"])
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
    // If projectId is provided, check if user is the project owner
    let isProjectOwner = false;
    if (projectId) {
      // Use our utility function to check project ownership
      isProjectOwner = await checkIsProjectOwner(projectId, userId);
      
      // Also verify the user has access to this project
      const hasAccess = await checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
    }
    
    // Base query for tasks by status
    let query = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.status",
        (eb) => eb.fn.count<number>("t.id").as("count")
      ]);
    
    // Apply project filter if provided
    if (projectId) {
      query = query.where("t.projectId", "=", projectId);
    }
    
    // If no project specified OR user is not the project owner, only show tasks they own or are assigned to
    if (!projectId || !isProjectOwner) {
      query = query.where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]));
    }
    
    const statusDistribution = await query
    .groupBy("t.status")
      .execute();
      
    // Calculate total tasks
    const totalTasks = statusDistribution.reduce((sum, item) => sum + Number(item.count), 0);
    // console.log("🚀 ~ getTaskStatusDistribution ~ totalTasks:", totalTasks)
    
    // Get overdue tasks count
    const now = new Date();
    let overdueQuery = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select((eb) => eb.fn.count<number>("t.id").as("count"))
      .where("t.dueDate", "<", now)
      .where("t.status", "!=", "Done");
    
    // Apply project filter if provided
    if (projectId) {
      overdueQuery = overdueQuery.where("t.projectId", "=", projectId);
    }
    
    // If no project specified OR user is not the project owner, only show tasks they own or are assigned to
    if (!projectId || !isProjectOwner) {
      overdueQuery = overdueQuery.where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]));
    }
    
    const overdueResult = await overdueQuery.executeTakeFirst();
    const overdueCount = Number(overdueResult?.count || 0);
    
    // Get approaching deadlines count
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    let approachingQuery = db
    .selectFrom("tasks as t")
    .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
    .select((eb) => eb.fn.count<number>("t.id").as("count"))
    .where("t.dueDate", ">=", now)
    .where("t.dueDate", "<=", nextWeek)
    .where("t.status", "!=", "Done");
    
    console.log("🚀 ~ getTaskStatusDistribution ~ approachingQuery:", approachingQuery)
    // Apply project filter if provided
    if (projectId) {
      approachingQuery = approachingQuery.where("t.projectId", "=", projectId);
    }
    
    // If no project specified OR user is not the project owner, only show tasks they own or are assigned to
    if (!projectId || !isProjectOwner) {
      approachingQuery = approachingQuery.where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]));
    }
    
    const approachingResult = await approachingQuery.executeTakeFirst();
    const approachingCount = Number(approachingResult?.count || 0);
    
    // Calculate completion rate
    const completedTasks = statusDistribution.find(item => item.status === "Done")?.count || 0;
    const completionRate = totalTasks > 0 ? Math.round((Number(completedTasks) / totalTasks) * 100) : 0;
    
    // Add percentage to each status
    const statusWithPercentage = statusDistribution.map(item => ({
      status: item.status || 'Unset',
      count: Number(item.count),
      percentage: totalTasks > 0 ? Math.round((Number(item.count) / totalTasks) * 100) : 0
    }));
    
    // Get most recent completed tasks (last 5)
    let recentCompletedQuery = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.id",
        "t.subject",
        "t.updatedAt",
        "t.completedAt",
        "t.projectId",
        "t.priority"
      ])
      .where("t.status", "=", "Done")
      .orderBy("t.completedAt", "desc")
      .limit(5);
    
    // Apply project filter if provided
    if (projectId) {
      recentCompletedQuery = recentCompletedQuery.where("t.projectId", "=", projectId);
    }
    
    // If no project specified OR user is not the project owner, only show tasks they own or are assigned to
    if (!projectId || !isProjectOwner) {
      recentCompletedQuery = recentCompletedQuery.where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]));
    }
    
    const recentCompleted = await recentCompletedQuery.execute();
    
    // We'll calculate completion time statistics in the application code instead of SQL
    // This is more compatible across different database systems
    const completedTasksWithDates = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.startDate", 
        "t.completedAt"
      ])
      .where("t.status", "=", "Done")
      .where("t.completedAt", "is not", null)
      .where("t.startDate", "is not", null);
    
    // Apply project filter if provided
    if (projectId) {
      completedTasksWithDates.where("t.projectId", "=", projectId);
    }
    
    // If no project specified OR user is not the project owner, only show tasks they own or are assigned to
    if (!projectId || !isProjectOwner) {
      completedTasksWithDates.where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]));
    }
    
    const tasksWithDates = await completedTasksWithDates.execute();
    
    // Calculate average completion days in JavaScript
    let totalDays = 0;
    let taskCount = 0;
    
    tasksWithDates.forEach(task => {
      if (task.startDate && task.completedAt) {
        const startDate = new Date(task.startDate);
        const completedDate = new Date(task.completedAt);
        const diffTime = completedDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          totalDays += diffDays;
          taskCount++;
        }
      }
    });
    
    const avgCompletionDays = taskCount > 0 ? Math.round(totalDays / taskCount) : null;
    
    return {
      distribution: statusWithPercentage,
      totalTasks,
      completedTasks: Number(completedTasks),
      completionRate,
      overdueCount,
      approachingCount,
      recentCompleted,
      avgCompletionDays,
      // Add a flag to indicate if these are partial stats (user only sees their own tasks)
      partialStats: projectId ? !isProjectOwner : true
    };
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
        "t.priority",
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

  async getTaskPriorityAnalysis(userId: number, projectId?: number) {
    // Base query for tasks by priority
    let query = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.priority",
        "t.status",
        (eb) => eb.fn.count<number>("t.id").as("count")
      ])
      .where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]))
      .groupBy(["t.priority", "t.status"]);

    // Add project filter if provided
    if (projectId) {
      const hasAccess = await this.verifyProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
      query = query.where("t.projectId", "=", projectId);
    }

    const result = await query.execute();

    // Transform to better structure for reporting
    const priorityMap: Record<string, { total: number, completed: number }> = {};

    result.forEach(item => {
      const priority = item.priority || 'Medium';

      if (!priorityMap[priority]) {
        priorityMap[priority] = { total: 0, completed: 0 };
      }

      priorityMap[priority].total += Number(item.count);
      if (item.status === 'Done') {
        priorityMap[priority].completed += Number(item.count);
      }
    });

    return Object.entries(priorityMap).map(([priority, stats]) => ({
      priority,
      ...stats,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  },

  async getTaskCompletionTrend(userId: number, days: number = 30, projectId?: number) {
    const endDate = new Date(new Date().setDate(new Date().getDate() + 1));
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Query for completed tasks within date range
    let completedQuery = db
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
      .orderBy("t.updatedAt", "asc");

    // Query for created tasks within date range
    let createdQuery = db
      .selectFrom("tasks as t")
      .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
      .select([
        "t.createdAt",
        "t.id"
      ])
      .where(eb => eb.or([
        eb("t.ownerId", "=", userId),
        eb("ta.userId", "=", userId)
      ]))
      .where("t.createdAt", ">=", startDate)
      .where("t.createdAt", "<=", endDate)
      .orderBy("t.createdAt", "asc");

    // Add project filter if provided
    if (projectId) {
      const hasAccess = await this.verifyProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error("Access denied to project");
      }
      completedQuery = completedQuery.where("t.projectId", "=", projectId);
      createdQuery = createdQuery.where("t.projectId", "=", projectId);
    }

    const completedTasks = await completedQuery.execute();
    const createdTasks = await createdQuery.execute();

    // Maps for completed and created tasks by date
    const completedMap = new Map();
    const createdMap = new Map();

    // Process completed tasks
    completedTasks.forEach(task => {
      const date = new Date(task.updatedAt);
      const dateStr = date.toISOString().split('T')[0];

      const currentCount = completedMap.get(dateStr) || 0;
      completedMap.set(dateStr, currentCount + 1);
    });

    // Process created tasks
    createdTasks.forEach(task => {
      const date = new Date(task.createdAt);
      const dateStr = date.toISOString().split('T')[0];

      const currentCount = createdMap.get(dateStr) || 0;
      createdMap.set(dateStr, currentCount + 1);
    });

    // Build result with both counts
    const trend = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      trend.push({
        date: dateStr,
        completed: completedMap.get(dateStr) || 0,
        created: createdMap.get(dateStr) || 0
      });
    }
    
    return trend;
  },

  async getAllProjectsSummary(userId: number) {
    // Get all projects the user owns or is a member of
    const projects = await db
      .selectFrom("projects as p")
      .leftJoin("projectmembers as pm", join => 
        join.onRef("pm.projectId", "=", "p.id")
        .on("pm.userId", "=", userId)
      )
      .select([
        "p.id",
        "p.name",
        "p.status",
        "p.startDate",
        "p.endDate",
        "p.ownerId",
        "p.description",
        "p.completedAt"
      ])
      .where(eb => eb.or([
        eb("p.ownerId", "=", userId),
        eb("pm.userId", "=", userId)
      ]))
      .distinct()
      .execute();
      
    // For each project, get summary stats
    const projectSummaries = [];
    
    for (const project of projects) {
      // Check if user is the project owner using our utility function
      const isProjectOwner = await checkIsProjectOwner(project.id, userId);
      
      // Task query base - different filtering based on user role
      let taskStatsQuery = db
        .selectFrom("tasks as t")
        .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
        .select([
          "t.status",
          (eb) => eb.fn.count<number>("t.id").as("count")
        ])
        .where("t.projectId", "=", project.id);
      
      // If user is not the project owner, only show tasks they own or are assigned to
      if (!isProjectOwner) {
        taskStatsQuery = taskStatsQuery.where(eb => eb.or([
          eb("t.ownerId", "=", userId),
          eb("ta.userId", "=", userId)
        ]));
      }
      
      const taskStats = await taskStatsQuery
        .groupBy("t.status")
        .execute();
        
        // Calculate completion percentage
        const totalTasks = taskStats.reduce((sum, stat) => sum + Number(stat.count), 0);
        const completedTasks = taskStats.find(stat => stat.status === "Done")?.count || 0;
        const completionPercentage = totalTasks > 0 
          ? Math.round((Number(completedTasks) / totalTasks) * 100) 
          : 0;
          
        // Get overdue tasks count - with proper access control
        const now = new Date();
        let overdueTasksQuery = db
          .selectFrom("tasks as t")
          .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
          .select((eb) => eb.fn.count<number>("t.id").as("count"))
          .where("t.projectId", "=", project.id)
          .where("t.dueDate", "<", now)
          .where("t.status", "!=", "Done");
          
        // If user is not the project owner, only show tasks they own or are assigned to
        if (!isProjectOwner) {
          overdueTasksQuery = overdueTasksQuery.where(eb => eb.or([
            eb("t.ownerId", "=", userId),
            eb("ta.userId", "=", userId)
          ]));
        }
        
        const overdueTasks = await overdueTasksQuery.executeTakeFirst();
          
        // Get approaching deadlines count - with proper access control
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        
        let approachingDeadlinesQuery = db
          .selectFrom("tasks as t")
          .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
          .select((eb) => eb.fn.count<number>("t.id").as("count"))
          .where("t.projectId", "=", project.id)
          .where("t.dueDate", ">=", now)
          .where("t.dueDate", "<=", nextWeek)
          .where("t.status", "!=", "Done");
          
        // If user is not the project owner, only show tasks they own or are assigned to
        if (!isProjectOwner) {
          approachingDeadlinesQuery = approachingDeadlinesQuery.where(eb => eb.or([
            eb("t.ownerId", "=", userId),
            eb("ta.userId", "=", userId)
          ]));
        }
        
        const approachingDeadlines = await approachingDeadlinesQuery.executeTakeFirst();

        // Get high priority tasks count
        let highPriorityTasksQuery = db
          .selectFrom("tasks as t")
          .leftJoin("task_assignments as ta", "ta.taskId", "t.id")
          .select((eb) => eb.fn.count<number>("t.id").as("count"))
          .where("t.projectId", "=", project.id)
          .where("t.priority", "in", ["High", "Urgent"])
          .where("t.status", "!=", "Done");
          
        // If user is not the project owner, only show tasks they own or are assigned to
        if (!isProjectOwner) {
          highPriorityTasksQuery = highPriorityTasksQuery.where(eb => eb.or([
            eb("t.ownerId", "=", userId),
            eb("ta.userId", "=", userId)
          ]));
        }
        
        const highPriorityTasks = await highPriorityTasksQuery.executeTakeFirst();
          
        // Get team members count
        const teamMembers = await db
          .selectFrom("projectmembers")
          .select((eb) => eb.fn.count<number>("userId").as("count"))
          .where("projectId", "=", project.id)
          .executeTakeFirst();
          
        projectSummaries.push({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          completedAt: project.completedAt,
          completionPercentage,
          totalTasks,
          completedTasks: Number(completedTasks),
          overdueTasks: Number(overdueTasks?.count || 0),
          approachingDeadlines: Number(approachingDeadlines?.count || 0),
          highPriorityTasks: Number(highPriorityTasks?.count || 0),
          teamMembers: Number(teamMembers?.count || 0) + 1, // +1 for owner
          isOwner: isProjectOwner,
          // Add a flag to indicate if these are partial stats (user only sees their own tasks)
          partialStats: !isProjectOwner
        });
    }
    
    // Calculate overall statistics
    const totalProjects = projectSummaries.length;
    const completedProjects = projectSummaries.filter(p => p.status === "Completed").length;
    const totalTasks = projectSummaries.reduce((sum, p) => sum + p.totalTasks, 0);
    const completedTasks = projectSummaries.reduce((sum, p) => sum + p.completedTasks, 0);
    const overdueTasks = projectSummaries.reduce((sum, p) => sum + p.overdueTasks, 0);
    const approachingDeadlines = projectSummaries.reduce((sum, p) => sum + p.approachingDeadlines, 0);
    const highPriorityTasks = projectSummaries.reduce((sum, p) => sum + (p.highPriorityTasks || 0), 0);
    
    return {
      summary: {
        totalProjects,
        completedProjects,
        projectCompletionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        overdueTasks,
        approachingDeadlines,
        highPriorityTasks
      },
      projects: projectSummaries
    };
  }

}


