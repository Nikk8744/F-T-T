/**
 * Enums for the application
 * These provide type safety for string literals used throughout the codebase
 */

/**
 * Task status options
 */
export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  DONE = 'Done'
}

/**
 * User role options
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

/**
 * Project status options
 */
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On-Hold',
  CANCELLED = 'Cancelled'
}

/**
 * Notification types
 */
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DEADLINE_APPROACHING = 'TASK_DEADLINE_APPROACHING',
  TASK_DEADLINE_MISSED = 'TASK_DEADLINE_MISSED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED'
}

/**
 * Entity types for notifications
 */
export enum EntityType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
  USER = 'USER'
} 