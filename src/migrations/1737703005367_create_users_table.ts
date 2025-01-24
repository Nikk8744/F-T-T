import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

	await db.schema
    .createTable('users')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)', col => col.notNull())
	.addColumn('userName', 'varchar(255)', col => col.notNull().unique())
    .addColumn('email', 'varchar(255)', col => col.unique().notNull())
    .addColumn('password', 'varchar(255)', col => col.notNull())
	.addColumn('role', 'varchar(255)', col => col.defaultTo('user').check(sql`role IN ('user', 'admin')`).notNull())
	.addColumn('refreshToken', 'varchar(255)')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
};

export async function down(db: Kysely<any>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema.dropTable('users').execute()
};
