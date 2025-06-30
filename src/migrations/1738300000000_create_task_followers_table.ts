import { type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('task_followers')
    .addColumn('taskId', 'integer', col => 
      col.references('tasks.id').onDelete('cascade').notNull()
    )
    .addColumn('userId', 'integer', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addPrimaryKeyConstraint('task_followers_pk', ['taskId', 'userId'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_followers').execute()
} 