import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
			.createTable('projects')
			.addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
			.addColumn('name', 'varchar(255)', col => col.notNull().unique())
			.addColumn('description', 'text', col => col.notNull())
			.addColumn('start_date', 'datetime', col => col.notNull())
			.addColumn('end_date', 'datetime', col => col.notNull())
			.addColumn('status', 'varchar(20)', col => col.defaultTo('Pending').check(sql`status IN('Pending', 'In-Progress', 'Completed')`))
			.addColumn('user_id', 'integer', col => col.notNull())
			.addColumn('total_hours', 'decimal', col => col.defaultTo(0))
			.addColumn('created_at', 'timestamp', col => 
				col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
			)
			.addColumn('updated_at', 'timestamp', col => 
				col.defaultTo(sql`CURRENT_TIMESTAMP`)
				.$call(column => column.modifyEnd(sql`ON UPDATE CURRENT_TIMESTAMP`))
				.notNull()
			)
			.addCheckConstraint('end_date_after_start_date', 
				sql`end_date >= start_date`
			)
			// relationship rule between projects table and users. so that if a user gets deleted, automatically delete all their projects too!
			.addForeignKeyConstraint(
				'projects_user_fk',
				['user_id'], 
				'users',
				['id'],
				(cb) => cb.onDelete('cascade')
			  )
			.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema.dropTable('projects').execute()

}
