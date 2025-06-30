import { sql } from "kysely";
import { db } from "../config/db";

export const taskAssignmentServices = {
  // Assign a task to a user
  async assignTaskToUser(taskId: number, userId: number) {
    try {
      // Check if assignment already exists
      const existingAssignment = await db
        .selectFrom("task_assignments")
        .select(["taskId", "userId"])
        .where("taskId", "=", taskId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingAssignment) {
        return existingAssignment; // Assignment already exists
      }

      // Create new assignment
      await db
        .insertInto("task_assignments")
        .values({
          taskId,
          userId,
        })
        .execute();

      return { taskId, userId };
    } catch (error) {
      console.error("Error assigning task to user:", error);
      throw error;
    }
  },

  // Unassign a user from a task
  async unassignUserFromTask(taskId: number, userId: number) {
    try {
      return await db
        .deleteFrom("task_assignments")
        .where("taskId", "=", taskId)
        .where("userId", "=", userId)
        .execute();
    } catch (error) {
      console.error("Error unassigning user from task:", error);
      throw error;
    }
  },

  // Get all users assigned to a task
  async getTaskAssignees(taskId: number) {
    try {
      return await db
        .selectFrom("task_assignments")
        .innerJoin("users", "users.id", "task_assignments.userId")
        .select([
          "users.id",
          "users.name",
          "users.userName",
          "users.email",
        ])
        .where("task_assignments.taskId", "=", taskId)
        .execute();
    } catch (error) {
      console.error("Error getting task assignees:", error);
      throw error;
    }
  },

  // Get all tasks assigned to a user
  async getUserAssignedTasks(userId: number) {
    try {
      return await db
        .selectFrom("task_assignments")
        .innerJoin("tasks", "tasks.id", "task_assignments.taskId")
        .select([
          "tasks.id",
          "tasks.subject",
          "tasks.description",
          "tasks.status",
          "tasks.startDate",
          "tasks.dueDate",
          "tasks.totalTimeSpent",
          "tasks.projectId",
          "tasks.ownerId",
          "tasks.priority",
          "tasks.completedAt",
          "tasks.createdAt",
        ])
        .where("task_assignments.userId", "=", userId)
        .where("tasks.ownerId", "!=", userId)
        .execute();
    } catch (error) {
      console.error("Error getting user assigned tasks:", error);
      throw error;
    }
  },

  // Add a follower to a task
  async addTaskFollower(taskId: number, userId: number) {
    try {
      // Check if follower already exists
      const existingFollower = await db
        .selectFrom("task_followers")
        .select(["taskId", "userId"])
        .where("taskId", "=", taskId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingFollower) {
        return existingFollower; // Follower already exists
      }

      // Create new follower
      await db
        .insertInto("task_followers")
        .values({
          taskId,
          userId,
        })
        .execute();

      return { taskId, userId };
    } catch (error) {
      console.error("Error adding task follower:", error);
      throw error;
    }
  },

  // Remove a follower from a task
  async removeTaskFollower(taskId: number, userId: number) {
    try {
      return await db
        .deleteFrom("task_followers")
        .where("taskId", "=", taskId)
        .where("userId", "=", userId)
        .execute();
    } catch (error) {
      console.error("Error removing task follower:", error);
      throw error;
    }
  },

  // Get all followers of a task
  async getTaskFollowers(taskId: number) {
    try {
      return await db
        .selectFrom("task_followers")
        .innerJoin("users", "users.id", "task_followers.userId")
        .select([
          "users.id",
          "users.name",
          "users.userName",
          "users.email",
        ])
        .where("task_followers.taskId", "=", taskId)
        .execute();
    } catch (error) {
      console.error("Error getting task followers:", error);
      throw error;
    }
  },

  // Get all tasks a user is following
  async getUserFollowedTasks(userId: number) {
    try {
      return await db
        .selectFrom("task_followers")
        .innerJoin("tasks", "tasks.id", "task_followers.taskId")
        .select([
          "tasks.id",
          "tasks.subject",
          "tasks.description",
          "tasks.status",
          "tasks.startDate",
          "tasks.dueDate",
          "tasks.totalTimeSpent",
          "tasks.projectId",
          "tasks.ownerId",
          "tasks.priority",
          "tasks.completedAt",
          "tasks.createdAt",
        ])
        .where("task_followers.userId", "=", userId)
        .execute();
    } catch (error) {
      console.error("Error getting user followed tasks:", error);
      throw error;
    }
  },
}; 