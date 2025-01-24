import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
			.createTable('project_members')
			.addColumn('project_id', 'integer', col => 
				col.references('projects.id').onDelete('cascade').notNull()
			)
			.addColumn('user_id', 'integer', col => 
				col.references('users.id').onDelete('cascade').notNull()
			)
			.addPrimaryKeyConstraint('project_members_pk', ['project_id', 'user_id'])
			.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('project_members').execute()
}
