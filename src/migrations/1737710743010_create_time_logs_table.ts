import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('time_logs')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)')
    .addColumn('description', 'text')
    .addColumn('start_time', 'datetime', col => col.notNull())
    .addColumn('end_time', 'datetime')
	.addColumn('user_id', 'integer', col => col.notNull())
	.addColumn('project_id', 'integer', col => col.notNull())
	.addColumn('task_id', 'integer', col => col.notNull())
    .addColumn('time_spent', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    // Relationships
    .addForeignKeyConstraint(
      'timelogs_project_fk',
      ['project_id'],
      'projects',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'timelogs_user_fk',
      ['user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'timelogs_task_fk',
      ['task_id'],
      'tasks',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').execute()
}