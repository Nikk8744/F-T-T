import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('task_checklists')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('task_id', 'integer', col => 
      col.references('tasks.id').onDelete('cascade').notNull()
    )
    .addColumn('item', 'varchar(255)', col => col.notNull())
    .addColumn('is_completed', 'boolean', col => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_checklists').execute()
}