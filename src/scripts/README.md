# Database Seeding

This directory contains scripts for seeding the database with test data.

## Seed Script

The seed script (`seed.ts`) populates the database with test data for all tables in the schema:

- Users (admin and regular users)
- Projects
- Project members
- Tasks
- Task assignments
- Task checklists
- Time logs
- Notifications
- Notification preferences

## How to Use

### Prerequisites

1. Make sure your database is set up and the connection details are in your `.env` file
2. Ensure all migrations have been run: `pnpm migrateAll`

### Running the Seed Script

```bash
# Using the npm/pnpm script
pnpm seed

# Or directly
ts-node src/scripts/seed.ts
```

### Test Data

The seed script creates:

- 5 users (1 admin, 4 regular users)
- 3 projects with different statuses (In-Progress, Pending, Completed)
- Project members associations
- 9 tasks with various statuses and due dates, including:
  - Completed tasks
  - Tasks approaching deadlines (due in a few days)
  - Tasks due tomorrow (very urgent)
  - Overdue tasks (past due date)
  - Tasks scheduled for the future
- Task assignments
- Task checklists
- Time logs for tracking work, with recent and past entries
- Sample notifications including:
  - Task assignments
  - Task updates
  - Deadline approaching warnings
  - Overdue task notifications
  - Both read and unread notifications
- Default notification preferences

### Test Credentials

All seeded users have the same password: `Test@123`

| Username      | Email               | Role  |
|---------------|---------------------|-------|
| admin         | admin@gmail.com     | admin |
| johndoe       | john@gmail.com      | user  |
| janesmith     | jane@gmail.com      | user  |
| bobjohnson    | bob@gmail.com       | user  |
| alicewilliams | alice@gmail.com     | user  |

## Customizing the Seed Data

If you need to modify the seed data, edit the `src/utils/seed.ts` file. The file is structured to make it easy to add or modify data for each table.

## Warning

Running the seed script will **delete all existing data** in the tables before inserting the test data. Do not run this on a production database. 