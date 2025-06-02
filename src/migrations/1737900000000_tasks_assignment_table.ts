import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create task_assignments table for multiple assignees
  await db.schema
    .createTable('task_assignments')
    .addColumn('taskId', 'integer', col => 
      col.references('tasks.id').onDelete('cascade').notNull()
    )
    .addColumn('userId', 'integer', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addPrimaryKeyConstraint('task_assignment_pk', ['taskId', 'userId'])
    .execute()

  // Create task_followers table
//   await db.schema
//     .createTable('task_followers')
//     .addColumn('taskId', 'integer', col => 
//       col.references('tasks.id').onDelete('cascade').notNull()
//     )
//     .addColumn('userId', 'integer', col => 
//       col.references('users.id').onDelete('cascade').notNull()
//     )
//     .addPrimaryKeyConstraint('task_follower_pk', ['taskId', 'userId'])
//     .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Down migration: Drop the new tables
//   await db.schema.dropTable('task_followers').execute()
  await db.schema.dropTable('task_assignments').execute()
} 