import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('timelogs')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)')
    .addColumn('description', 'text')
    .addColumn('startTime', 'datetime', col => col.notNull())
    .addColumn('endTime', 'datetime')
	.addColumn('userId', 'integer', col => col.notNull())
	.addColumn('projectId', 'integer', col => col.references('projects.id').onDelete('cascade'))
	.addColumn('taskId', 'integer', col => col.references('tasks.id').onDelete('cascade'))
    .addColumn('timeSpent', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('createdAt', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    // Relationships
    .addForeignKeyConstraint(
      'timelogs_project_fk',
      ['projectId'],
      'projects',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'timelogs_user_fk',
      ['userId'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'timelogs_task_fk',
      ['taskId'],
      'tasks',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').execute()
}