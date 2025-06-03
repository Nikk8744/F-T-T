import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create notifications table
  await db.schema
    .createTable('notifications')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('userId', 'integer', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('type', 'varchar(50)', col => col.notNull())
    .addColumn('title', 'varchar(255)', col => col.notNull())
    .addColumn('message', 'text', col => col.notNull())
    .addColumn('entityType', 'varchar(50)', col => col.notNull())
    .addColumn('entityId', 'integer', col => col.notNull())
    .addColumn('initiatorId', 'integer', col => 
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('isRead', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('createdAt', 'timestamp', col => 
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  // Create notification preferences table
  await db.schema
    .createTable('notification_preferences')
    .addColumn('userId', 'integer', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('type', 'varchar(50)', col => col.notNull())
    .addColumn('enabled', 'boolean', col => col.defaultTo(true).notNull())
    .addPrimaryKeyConstraint('notification_preferences_pk', ['userId', 'type'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('notification_preferences').execute()
  await db.schema.dropTable('notifications').execute()
}