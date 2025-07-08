import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // High-impact indexes for tasks table
  await db.schema
    .createIndex('tasks_project_id_index')
    .on('tasks')
    .column('projectId')
    .execute();

  await db.schema
    .createIndex('tasks_status_due_date_index')
    .on('tasks')
    .columns(['status', 'dueDate'])
    .execute();

  // Critical indexes for timelogs table (high query volume)
  await db.schema
    .createIndex('timelogs_user_id_index')
    .on('timelogs')
    .column('userId')
    .execute();

  await db.schema
    .createIndex('timelogs_project_task_index')
    .on('timelogs')
    .columns(['projectId', 'taskId'])
    .execute();

  await db.schema
    .createIndex('timelogs_start_time_index')
    .on('timelogs')
    .column('startTime')
    .execute();

  // Essential indexes for projects table
  await db.schema
    .createIndex('projects_owner_status_index')
    .on('projects')
    .columns(['ownerId', 'status'])
    .execute();

  // Critical index for notifications (frequently filtered)
  await db.schema
    .createIndex('notifications_user_id_read_index')
    .on('notifications')
    .columns(['userId', 'isRead'])
    .execute();

  // Essential index for project members (frequent lookup)
  await db.schema
    .createIndex('projectmembers_user_project_index')
    .on('projectmembers')
    .columns(['userId', 'projectId'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop task indexes
  await db.schema.dropIndex('tasks_project_id_index').execute();
  await db.schema.dropIndex('tasks_status_due_date_index').execute();

  // Drop timelog indexes
  await db.schema.dropIndex('timelogs_user_id_index').execute();
  await db.schema.dropIndex('timelogs_project_task_index').execute();
  await db.schema.dropIndex('timelogs_start_time_index').execute();

  // Drop project indexes
  await db.schema.dropIndex('projects_owner_status_index').execute();

  // Drop notification indexes
  await db.schema.dropIndex('notifications_user_id_read_index').execute();

  // Drop project member indexes
  await db.schema.dropIndex('projectmembers_user_project_index').execute();
} 