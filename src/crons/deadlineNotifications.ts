import { db } from "../config/db";
import { notificationService, NotificationType, EntityType } from "../services/Notification.service";

// Configuration
const APPROACHING_DEADLINE_DAYS = 2; // Consider deadline approaching if within 2 days

// Check for tasks with approaching deadlines and send notifications
export async function checkTaskDeadlines(): Promise<void> {
  try {
    // Get current date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Calculate the date threshold for approaching deadlines
    const approachingDate = new Date(now);
    approachingDate.setDate(now.getDate() + APPROACHING_DEADLINE_DAYS);
    
    console.log(`Checking for task deadlines approaching on or before ${approachingDate.toISOString().split('T')[0]}`);
    console.log(`Checking for task deadlines missed as of ${now.toISOString().split('T')[0]}`);
    
    // 1. Find tasks with approaching deadlines (due within APPROACHING_DEADLINE_DAYS)
    const approachingTasks = await db
      .selectFrom("tasks")
      .select([
        "id", 
        "subject", 
        "dueDate", 
        "ownerId", 
        "projectId"
      ])
      .where((eb) => eb.and([
        eb("dueDate", "<=", approachingDate),
        eb("dueDate", ">", now),
        eb("status", "!=", "Done")
      ]))
      .execute();
    
    console.log(`Found ${approachingTasks.length} tasks with approaching deadlines`);
    
    // 2. Find tasks with missed deadlines (due date in the past, not completed)
    const missedTasks = await db
      .selectFrom("tasks")
      .select([
        "id", 
        "subject", 
        "dueDate", 
        "ownerId", 
        "projectId"
      ])
      .where((eb) => eb.and([
        eb("dueDate", "<", now),
        eb("status", "!=", "Done")
      ]))
      .execute();
    
    console.log(`Found ${missedTasks.length} tasks with missed deadlines`);
    
    // Process approaching deadline notifications
    for (const task of approachingTasks) {
      await sendTaskDeadlineNotifications(task, true);
    }
    
    // Process missed deadline notifications
    for (const task of missedTasks) {
      await sendTaskDeadlineNotifications(task, false);
    }
    
    console.log("Task deadline notifications processed successfully");
  } catch (error) {
    console.error("Error checking task deadlines:", error);
  }
}


// Check for projects with approaching deadlines and send notifications
export async function checkProjectDeadlines(): Promise<void> {
  try {
    // Get current date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Calculate the date threshold for approaching deadlines
    const approachingDate = new Date(now);
    approachingDate.setDate(now.getDate() + APPROACHING_DEADLINE_DAYS);
    
    console.log(`Checking for project deadlines approaching on or before ${approachingDate.toISOString().split('T')[0]}`);
    console.log(`Checking for project deadlines missed as of ${now.toISOString().split('T')[0]}`);
    
    // 1. Find projects with approaching deadlines
    const approachingProjects = await db
      .selectFrom("projects")
      .select([
        "id", 
        "name", 
        "endDate as dueDate", // Using endDate as the dueDate field for projects
        "ownerId"
      ])
      .where((eb) => eb.and([
        eb("endDate", "<=", approachingDate),
        eb("endDate", ">", now),
        eb("status", "!=", "completed")
      ]))
      .execute();
    
    console.log(`Found ${approachingProjects.length} projects with approaching deadlines`);
    
    // 2. Find projects with missed deadlines
    const missedProjects = await db
      .selectFrom("projects")
      .select([
        "id", 
        "name", 
        "endDate as dueDate", // Using endDate as the dueDate field for projects
        "ownerId"
      ])
      .where((eb) => eb.and([
        eb("endDate", "<", now),
        eb("status", "!=", "completed")
      ]))
      .execute();
    
    console.log(`Found ${missedProjects.length} projects with missed deadlines`);
    
    // Process approaching deadline notifications
    for (const project of approachingProjects) {
      await sendProjectDeadlineNotifications(project, true);
    }
    
    // Process missed deadline notifications
    for (const project of missedProjects) {
      await sendProjectDeadlineNotifications(project, false);
    }
    
    console.log("Project deadline notifications processed successfully");
  } catch (error) {
    console.error("Error checking project deadlines:", error);
  }
}

// Send notifications for task deadlines
async function sendTaskDeadlineNotifications(task: any, isApproaching: boolean): Promise<void> {
  try {
    // Get task assignees
    const assignees = await db
      .selectFrom("task_assignments")
      .select(["userId"])
      .where("taskId", "=", task.id)
      .execute();
    
    // Combine the owner with assignees
    const usersToNotify = new Set<number>();
    
    // Add task owner
    if (task.ownerId) {
      usersToNotify.add(task.ownerId);
    }
    
    // Add all assignees
    assignees.forEach(assignee => usersToNotify.add(assignee.userId));
    
    // Convert Set to Array
    const userIdsArray = Array.from(usersToNotify);
    
    if (userIdsArray.length === 0) {
      console.log(`No users to notify for task ${task.id}`);
      return;
    }
    
    // Prepare notification data
    const notificationType = isApproaching 
      ? NotificationType.DEADLINE_APPROACHING 
      : NotificationType.DEADLINE_MISSED;
    
    const title = isApproaching 
      ? 'Task Deadline Approaching' 
      : 'Task Deadline Missed';
    
    const message = isApproaching 
      ? `The deadline for task "${task.subject}" is approaching soon.` 
      : `The deadline for task "${task.subject}" has passed.`;
    
    // Create notifications for all users
    await notificationService.createNotificationsForUsers(userIdsArray, {
      type: notificationType,
      title,
      message,
      entityType: EntityType.TASK,
      entityId: task.id
    });
    
    console.log(`Sent ${isApproaching ? 'approaching' : 'missed'} deadline notifications for task ${task.id} to ${userIdsArray.length} users`);
  } catch (error) {
    console.error(`Error sending task deadline notifications for task ${task.id}:`, error);
  }
}

//  Send notifications for project deadlines
async function sendProjectDeadlineNotifications(project: any, isApproaching: boolean): Promise<void> {
  try {
    // Get all project members
    const projectMembers = await db
      .selectFrom("projectmembers")
      .select(["userId"])
      .where("projectId", "=", project.id)
      .execute();
    
    // Combine project members with the owner
    const usersToNotify = new Set<number>();
    
    // Add project owner
    if (project.ownerId) {
      usersToNotify.add(project.ownerId);
    }
    
    // Add project members
    projectMembers.forEach(member => usersToNotify.add(member.userId));
    
    // Convert Set to Array
    const userIdsArray = Array.from(usersToNotify);
    
    if (userIdsArray.length === 0) {
      console.log(`No users to notify for project ${project.id}`);
      return;
    }
    
    // Prepare notification data
    const notificationType = isApproaching 
      ? NotificationType.DEADLINE_APPROACHING 
      : NotificationType.DEADLINE_MISSED;
    
    const title = isApproaching 
      ? 'Project Deadline Approaching' 
      : 'Project Deadline Missed';
    
    const message = isApproaching 
      ? `The deadline for project "${project.name}" is approaching soon.` 
      : `The deadline for project "${project.name}" has passed.`;
    
    // Create notifications for all users
    await notificationService.createNotificationsForUsers(userIdsArray, {
      type: notificationType,
      title,
      message,
      entityType: EntityType.PROJECT,
      entityId: project.id
    });
    
    console.log(`Sent ${isApproaching ? 'approaching' : 'missed'} deadline notifications for project ${project.id} to ${userIdsArray.length} users`);
  } catch (error) {
    console.error(`Error sending project deadline notifications for project ${project.id}:`, error);
  }
}

// Main function to check all deadlines
export async function checkAllDeadlines(): Promise<void> {
  console.log("Starting deadline notification check...");
  
  await checkTaskDeadlines();
  await checkProjectDeadlines();
  
  console.log("Deadline notification check completed");
} 