import { TaskStatus, UserRole, TaskPriority, ProjectStatus, NotificationType, EntityType } from './enums';

/**
 * User model interface
 */
export interface User {
  id: number;
  name: string;
  userName: string;
  email: string;
  password: string;
  role: UserRole;
  refreshToken: string | null;
  createdAt: Date;
}

/**
 * Safe user interface (without sensitive fields)
 */
export interface SafeUser {
  id: number;
  name: string;
  userName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Project model interface
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus | null;
  ownerId: number;
  totalHours: number | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/**
 * Task model interface
 */
export interface Task {
  id: number;
  subject: string;
  description: string | null;
  status: TaskStatus | null;
  startDate: Date;
  dueDate: Date | null;
  totalTimeSpent: number | null;
  projectId: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  priority: TaskPriority | null;
}

/**
 * Task checklist item interface
 */
export interface TaskChecklistItem {
  id: number;
  taskId: number;
  item: string;
  isCompleted: boolean | null;
  createdAt: Date;
}

/**
 * Time log interface
 */
export interface TimeLog {
  id: number;
  userId: number;
  taskId: number | null;
  projectId: number | null;
  name: string | null;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  timeSpent: number;
  createdAt: Date;
}

/**
 * Project member interface
 */
export interface ProjectMember {
  projectId: number;
  userId: number;
}

/**
 * Task assignment interface
 */
export interface TaskAssignment {
  taskId: number;
  userId: number;
}

/**
 * Notification interface
 */
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: EntityType;
  entityId: number;
  initiatorId: number | null;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification preference interface
 */
export interface NotificationPreference {
  userId: number;
  type: NotificationType;
  enabled: boolean;
} 