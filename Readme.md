# Freelance TT in - TS with MySQL(Kysely)



 ## Types Definations

 ## Migrations
 A migration is a script that defines the structure of your database schema (such as creating or modifying tables, columns, or constraints). In essence, migrations are used to version control the changes to your database schema. Instead of manually creating tables via a database GUI (like MySQL Workbench), you use migrations to define the changes programmatically. This helps ensure consistency across different environments (development, production, etc.) and makes it easier to track changes to the database over time.
 - Migrations are a way to automatically manage your database schema in a controlled manner.
 - You define migrations in code, and running them will modify the database structure (e.g., creating tables, adding columns).
 - Migrations allow you to avoid manually creating tables in a GUI tool like MySQL Workbench.
 - Running migrations ensures that your database schema is consistent and version-controlled.
#### Tools for migration
- knex migration ( or kysely built-in migration tool but its not that good, so you could use knex)
- sequelize migration
- typeorm migration
- prisma migration

#### Services and Controllers
##### Why to separate them
controllers are responsible for handling HTTP-specific tasks, like getting data from the request, validating input (though the user isn't doing validation yet), and sending responses. Services, on the other hand, handle the application's business logic, interacting with the database, performing calculations, and other operations that aren't tied to the web layer. This separation allows reusing services in different parts of the application, like in CLI tools or other controllers, without duplicating code.

### tables
#### users
#### projects
#### tasks
#### logs
#### project_members
#### task_checklists

## Todos:
-  write a cron to check due dates of tasks and send notifications for upcoming due date(like 5 hrs before) and also notifications for passed due tasks.
-  if possible then in getAllUsersProjects lets also send projects that the user is member of so that we will have all the projects related to that user.
-  add cacheing 
-  add proper typescript types and interfaces.
-  add indexing to db schemas 
-  implement rate-limiting and throttling
-  


