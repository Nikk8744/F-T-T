import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
			.createTable('projectmembers')
			.addColumn('projectId', 'integer', col => 
				col.references('projects.id').onDelete('cascade').notNull()
			)
			.addColumn('userId', 'integer', col => 
				col.references('users.id').onDelete('cascade').notNull()
			)
			.addPrimaryKeyConstraint('project_members_pk', ['projectId', 'userId'])
			.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('projectmembers').execute()
}
