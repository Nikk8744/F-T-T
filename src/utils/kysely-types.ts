/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Decimal = ColumnType<string, number | string>;

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Projectmembers {
  projectId: number;
  userId: number;
}

export interface Projects {
  createdAt: Generated<Date>;
  description: string;
  endDate: Date;
  id: Generated<number>;
  name: string;
  startDate: Date;
  status: Generated<string | null>;
  totalHours: Generated<Decimal | null>;
  updatedAt: Generated<Date>;
  userId: number;
}

export interface Taskchecklists {
  createdAt: Generated<Date>;
  id: Generated<number>;
  isCompleted: Generated<boolean | null>;
  item: string;
  taskId: number;
}

export interface Tasks {
  assignedUserId: number;
  createdAt: Generated<Date>;
  description: string | null;
  dueDate: Date | null;
  id: Generated<number>;
  projectId: number;
  startDate: Generated<Date>;
  status: Generated<string | null>;
  subject: string;
  totalTimeSpent: Generated<number | null>;
  updatedAt: Generated<Date>;
}

export interface Timelogs {
  createdAt: Generated<Date>;
  description: string | null;
  endTime: Date | null;
  id: Generated<number>;
  name: string | null;
  projectId: number | null;
  startTime: Date;
  taskId: number | null;
  timeSpent: Generated<number>;
  userId: number;
}

export interface Users {
  createdAt: Generated<Date>;
  email: string;
  id: Generated<number>;
  name: string;
  password: string;
  refreshToken: string | null;
  role: Generated<string>;
  userName: string;
}

export interface DB {
  projectmembers: Projectmembers;
  projects: Projects;
  taskchecklists: Taskchecklists;
  tasks: Tasks;
  timelogs: Timelogs;
  users: Users;
}
