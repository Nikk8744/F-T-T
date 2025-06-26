import { Request } from 'express';
import { User, SafeUser, Task, Project } from './models';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Request with ID parameter
 */
export interface RequestWithId extends Request {
  params: {
    id: string;
  };
}

/**
 * Authenticated request with ID parameter
 */
export interface AuthenticatedRequestWithId extends AuthenticatedRequest {
  params: {
    id: string;
  };
}

/**
 * Task creation request body
 */
export interface TaskCreateRequest {
  subject: string;
  description?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
  checklistItems?: Array<string | { item: string; isCompleted?: boolean }>;
}

/**
 * Task update request body
 */
export interface TaskUpdateRequest {
  subject?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
}

/**
 * Project creation request body
 */
export interface ProjectCreateRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
}

/**
 * Project update request body
 */
export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * User creation request body
 */
export interface UserCreateRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
  role?: string;
}

/**
 * User update request body
 */
export interface UserUpdateRequest {
  name?: string;
  userName?: string;
  email?: string;
  role?: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Task assignment request params
 */
export interface TaskAssignmentParams {
  taskId: string;
  userId: string;
}

/**
 * Bulk task assignment request body
 */
export interface BulkAssignRequest {
  userIds: number[];
}

/**
 * Task with assignees response
 */
export interface TaskWithAssignees extends Task {
  assignees: SafeUser[];
}

/**
 * Project with members response
 */
export interface ProjectWithMembers extends Project {
  members: SafeUser[];
}

/**
 * Task with relationship type
 */
export interface TaskWithRelationship extends Task {
  relationshipType: 'owned' | 'assigned';
} 