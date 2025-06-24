import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add completedAt to tasks table
  await db.schema
    .alterTable('tasks')
    .addColumn('completedAt', 'datetime')
    .addColumn('priority', 'varchar(10)', col => 
      col.defaultTo('Medium').check(sql`priority IN ('Low', 'Medium', 'High', 'Urgent')`)
    )
    .execute()
  
  // Add completedAt to projects table
  await db.schema
    .alterTable('projects')
    .addColumn('completedAt', 'datetime')
    .execute()

  // Update existing completed tasks
  await db.updateTable('tasks')
    .set({ 
      completedAt: sql`CASE WHEN status = 'Done' THEN updatedAt ELSE NULL END`
    })
    .execute()
  
  // Update existing completed projects
  await db.updateTable('projects')
    .set({ 
      completedAt: sql`CASE WHEN status = 'Completed' THEN updatedAt ELSE NULL END`
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove completedAt and priority from tasks table
  await db.schema
    .alterTable('tasks')
    .dropColumn('completedAt')
    .dropColumn('priority')
    .execute()
  
  // Remove completedAt from projects table
  await db.schema
    .alterTable('projects')
    .dropColumn('completedAt')
    .execute()
} 