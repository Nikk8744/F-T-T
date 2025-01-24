# Freelance TT in - TS with MySQL(Kysely)



 ## Types Definations

 ## Migrations
 A migration is a script that defines the structure of your database schema (such as creating or modifying tables, columns, or constraints). In essence, migrations are used to version control the changes to your database schema. Instead of manually creating tables via a database GUI (like MySQL Workbench), you use migrations to define the changes programmatically. This helps ensure consistency across different environments (development, production, etc.) and makes it easier to track changes to the database over time.
 - Migrations are a way to automatically manage your database schema in a controlled manner.
 - You define migrations in code, and running them will modify the database structure (e.g., creating tables, adding columns).
 - Migrations allow you to avoid manually creating tables in a GUI tool like MySQL Workbench.
 - Running migrations ensures that your database schema is consistent and version-controlled.
#### Tools for migration
- knex migration (kysely doesnt have a built-in migration tool, so you would use knex)
- sequelize migration
- typeorm migration
- prisma migration


### tables
#### users

#### projects

#### tasks

#### logs

#### project_members

#### task_checklists
