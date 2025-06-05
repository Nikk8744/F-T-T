import { db } from "../config/db";
import { Insertable } from "kysely";
import { DB, Notifications } from "../utils/kysely-types";
import { sendNotificationToUser } from "../utils/websocket";

// Define notification types
export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED',
  USER_ADDED_TO_PROJECT = 'USER_ADDED_TO_PROJECT',
  TASK_COMMENT_ADDED = 'TASK_COMMENT_ADDED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  DEADLINE_MISSED = 'DEADLINE_MISSED'
}

// Define entity types
export enum EntityType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
  USER = 'USER',
  COMMENT = 'COMMENT'
}

interface NotificationData {
  userId: number; 
  type: NotificationType;
  title: string;
  message: string;
  entityType: EntityType;
  entityId: number;
  initiatorId?: number | null;
}

export const notificationService = {
  // Create a notification
  async createNotification(data: NotificationData): Promise<any> {
    // Check if user has enabled this notification type
    // Commented out to allow all notifications to be sent regardless of preferences
    /*
    const preference = await db
      .selectFrom('notification_preferences')
      .select(['enabled'])
      .where('userId', '=', data.userId)
      .where('type', '=', data.type)
      .executeTakeFirst();
    
    // If preference exists and is disabled, don't create notification
    if (preference && !preference.enabled) {
      throw new Error(`User has disabled notifications of type ${data.type}`);
    }
    */
    
    const notification = await db
      .insertInto('notifications')
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        initiatorId: data.initiatorId || null,
        isRead: false
      })
      .executeTakeFirstOrThrow();
    
    const createdNotification = await db
      .selectFrom('notifications')
      .selectAll()
      .where('id', '=', Number(notification.insertId))
      .executeTakeFirstOrThrow();
      
    // Send real-time notification via WebSocket
    try {
      await sendNotificationToUser(data.userId, createdNotification);
    } catch (error) {
      console.error('Failed to send real-time notification:', error);
      // Continue even if real-time notification fails
    }
    
    return createdNotification;
  },
  
  // Create notifications for multiple users
  async createNotificationsForUsers(userIds: number[], data: Omit<NotificationData, 'userId'>): Promise<any[]> {
    console.log("createNotificationsForUsers received userIds:", userIds);
    
    if (!userIds || userIds.length === 0) {
      console.log("No user IDs provided to createNotificationsForUsers");
      return [];
    }
    
    const notifications: any[] = [];
    
    for (const userId of userIds) {
      try {
        console.log(`Creating notification for user ${userId}`);
        const notification = await this.createNotification({
          ...data,
          userId
        });
        notifications.push(notification);
        console.log(`Successfully created notification for user ${userId}`);
      } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
        // Continue with other users even if one fails
      }
    }
    
    console.log(`Created ${notifications.length} notifications out of ${userIds.length} users`);
    return notifications;
  },
  
  // Get user's notifications
  async getUserNotifications(userId: number, limit = 50, offset = 0): Promise<any[]> {
    return db
      .selectFrom('notifications')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  },
  
  // Get user's unread notifications count
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .selectFrom('notifications')
      .select(({ fn }) => [fn.count('id').as('count')])
      .where('userId', '=', userId)
      .where('isRead', '=', false)
      .executeTakeFirst();
      
    return Number(result?.count || 0);
  },
  
  // Mark notification as read
  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    await db
      .updateTable('notifications')
      .set({ isRead: true })
      .where('id', '=', notificationId)
      .where('userId', '=', userId)
      .execute();
  },
  
  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .updateTable('notifications')
      .set({ isRead: true })
      .where('userId', '=', userId)
      .execute();
  },
  
  // Delete a notification
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    await db
      .deleteFrom('notifications')
      .where('id', '=', notificationId)
      .where('userId', '=', userId)
      .execute();
  },
  
  // // Get user's notification preferences
  // async getUserNotificationPreferences(userId: number): Promise<any[]> {
  //   return db
  //     .selectFrom('notification_preferences')
  //     .selectAll()
  //     .where('userId', '=', userId)
  //     .execute();
  // },
  
  // // Update user's notification preference
  // async updateNotificationPreference(userId: number, type: NotificationType, enabled: boolean): Promise<void> {
  //   // Check if preference exists
  //   const preference = await db
  //     .selectFrom('notification_preferences')
  //     .select(['userId'])
  //     .where('userId', '=', userId)
  //     .where('type', '=', type)
  //     .executeTakeFirst();
    
  //   if (preference) {
  //     // Update existing preference
  //     await db
  //       .updateTable('notification_preferences')
  //       .set({ enabled })
  //       .where('userId', '=', userId)
  //       .where('type', '=', type)
  //       .execute();
  //   } else {
  //     // Create new preference
  //     await db
  //       .insertInto('notification_preferences')
  //       .values({
  //         userId,
  //         type,
  //         enabled
  //       })
  //       .execute();
  //   }
  // },
  
  // Initialize default notification preferences for a user
  // async initializeUserNotificationPreferences(userId: number): Promise<void> {
  //   const notificationTypes = Object.values(NotificationType);
    
  //   for (const type of notificationTypes) {
  //     await this.updateNotificationPreference(userId, type, true);
  //   }
  // },
  
  // Create task-related notifications
  async notifyTaskCreated(taskId: number, task: any, initiatorId: number): Promise<void> {
    // Notify project owner and members
    const projectMembers = await db
      .selectFrom('projectmembers')
      .select(['userId'])
      .where('projectId', '=', task.projectId)
      .execute();
    
    const projectOwner = await db
      .selectFrom('projects')
      .select(['ownerId'])
      .where('id', '=', task.projectId)
      .executeTakeFirst();
    
    const usersToNotify = new Set<number>();
    
    // Add project members
    projectMembers.forEach(member => usersToNotify.add(member.userId));
    
    // Add project owner if exists
    if (projectOwner) {
      usersToNotify.add(projectOwner.ownerId);
    }
    
    // Remove the initiator from the notification list
    usersToNotify.delete(initiatorId);
    
    // Convert Set to Array properly
    const userIdsArray = Array.from(usersToNotify);
    
    if (userIdsArray.length === 0) {
      console.log("No users to notify for task creation");
      return;
    }
    
    // Create notifications
    await this.createNotificationsForUsers(userIdsArray, {
      type: NotificationType.TASK_CREATED,
      title: 'New Task Created',
      message: `A new task "${task.subject}" has been created in your project.`,
      entityType: EntityType.TASK,
      entityId: taskId,
      initiatorId
    });
  },
  
  async notifyTaskUpdated(taskId: number, task: any, initiatorId: number): Promise<void> {
    // Get task assignees
    const assignees = await db
      .selectFrom('task_assignments')
      .select(['userId'])
      .where('taskId', '=', taskId)
      .execute();
    
    const usersToNotify = new Set<number>();
    
    // Add assignees
    assignees.forEach(assignee => usersToNotify.add(assignee.userId));
    
    // Add task owner
    if (task.ownerId) {
      usersToNotify.add(task.ownerId);
    }
    
    // Remove the initiator from the notification list
    usersToNotify.delete(initiatorId);
    
    // Convert Set to Array properly
    const userIdsArray = Array.from(usersToNotify);
    
    if (userIdsArray.length === 0) {
      console.log("No users to notify for task update");
      return;
    }
    
    // Create notifications
    await this.createNotificationsForUsers(userIdsArray, {
      type: NotificationType.TASK_UPDATED,
      title: 'Task Updated',
      message: `The task "${task.subject}" has been updated.`,
      entityType: EntityType.TASK,
      entityId: taskId,
      initiatorId
    });
  },
  
  async notifyTaskCompleted(taskId: number, task: any, initiatorId: number): Promise<void> {
    // Get task assignees
    const assignees = await db
      .selectFrom('task_assignments')
      .select(['userId'])
      .where('taskId', '=', taskId)
      .execute();
    
    // Get project owner
    const projectOwner = await db
      .selectFrom('projects')
      .select(['ownerId'])
      .where('id', '=', task.projectId)
      .executeTakeFirst();
    
    const usersToNotify = new Set<number>();
    
    // Add assignees
    assignees.forEach(assignee => usersToNotify.add(assignee.userId));
    
    // Add task owner and project owner
    if (task.ownerId) {
      usersToNotify.add(task.ownerId);
    }
    
    if (projectOwner) {
      usersToNotify.add(projectOwner.ownerId);
    }
    
    // Remove the initiator from the notification list
    usersToNotify.delete(initiatorId);
    
    // Convert Set to Array properly
    const userIdsArray = Array.from(usersToNotify);
    
    if (userIdsArray.length === 0) {
      console.log("No users to notify for task completion");
      return;
    }
    
    // Create notifications
    await this.createNotificationsForUsers(userIdsArray, {
      type: NotificationType.TASK_COMPLETED,
      title: 'Task Completed',
      message: `The task "${task.subject}" has been marked as complete.`,
      entityType: EntityType.TASK,
      entityId: taskId,
      initiatorId
    });
  },
  
  async notifyTaskAssigned(taskId: number, task: any, assigneeId: number, initiatorId: number): Promise<void> {
    // Only notify the assignee
    await this.createNotification({
      userId: assigneeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned to You',
      message: `You have been assigned to the task "${task.subject}".`,
      entityType: EntityType.TASK,
      entityId: taskId,
      initiatorId
    });
  },
  
  async notifyProjectCompleted(projectId: number, project: any, initiatorId: number): Promise<void> {
    // Get project members
    const projectMembers = await db
      .selectFrom('projectmembers')
      .select(['userId'])
      .where('projectId', '=', projectId)
      .execute();
    
    const usersToNotify = new Set<number>();
    
    // Add project members
    projectMembers.forEach(member => usersToNotify.add(member.userId));
    console.log("🚀 ~ notifyProjectCompleted ~ usersToNotify:", usersToNotify);
    
    // Remove the initiator from the notification list
    usersToNotify.delete(initiatorId);
    console.log("🚀 ~ notifyProjectCompleted ~ usersToNotify after removing initiator:", usersToNotify);
    
    // Convert Set to Array properly
    const userIdsArray = Array.from(usersToNotify);
    console.log("🚀 ~ notifyProjectCompleted ~ userIdsArray:", userIdsArray);
    
    if (userIdsArray.length === 0) {
      console.log("No users to notify after filtering");
      return;
    }
    
    // Create notifications
    const notifications = await this.createNotificationsForUsers(userIdsArray, {
      type: NotificationType.PROJECT_COMPLETED,
      title: 'Project Completed',
      message: `The project "${project.name}" has been marked as complete.`,
      entityType: EntityType.PROJECT,
      entityId: projectId,
      initiatorId
    });
    console.log("Notifications created:", notifications);
  },
  
  async notifyUserAddedToProject(projectId: number, project: any, userId: number, initiatorId: number): Promise<void> {
    // Notify the user who was added to the project
    await this.createNotification({
      userId,
      type: NotificationType.USER_ADDED_TO_PROJECT,
      title: 'Added to Project',
      message: `You have been added to the project "${project.name}".`,
      entityType: EntityType.PROJECT,
      entityId: projectId,
      initiatorId
    });
  }
}; 