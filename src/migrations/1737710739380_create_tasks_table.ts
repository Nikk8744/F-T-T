import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
    .createTable('tasks')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('subject', 'varchar(50)', col => col.notNull()) // Replaces title
    .addColumn('description', 'text')
    .addColumn('status', 'varchar(20)', col => 
      col.defaultTo('Pending').check(sql`status IN ('Pending', 'In-Progress', 'Done')`)
    )
    .addColumn('start_date', 'datetime', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('due_date', 'datetime')
    .addColumn('total_time_spent', 'integer', col => col.defaultTo(0))
	.addColumn('assigned_user_id', 'integer', col => col.notNull())
	.addColumn('project_id', 'integer', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
        .$call(column => column.modifyEnd(sql`ON UPDATE CURRENT_TIMESTAMP`))
        .notNull()
    )
    // Relationships
    .addForeignKeyConstraint(
      'tasks_assigned_user_fk',
      ['assigned_user_id'],
      'users',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'tasks_project_fk',
      ['project_id'],
      'projects',
      ['id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute()

  // Create index for subject search
  await db.schema
    .createIndex('tasks_subject_index')
    .on('tasks')
    .column('subject')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('tasks').execute()
}
