import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { db } from '../config/db';

// Load environment variables

/**
 * Seed function to populate the database with test data
 */
export async function seedDatabase() {    
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data (in reverse order of dependencies)
        console.log('Clearing existing data...');
        // await db.deleteFrom('notification_preferences').execute();
        await db.deleteFrom('notifications').execute();
        await db.deleteFrom('task_assignments').execute();
        await db.deleteFrom('taskchecklists').execute();
        await db.deleteFrom('timelogs').execute();
        await db.deleteFrom('tasks').execute();
        await db.deleteFrom('projectmembers').execute();
        await db.deleteFrom('projects').execute();
        await db.deleteFrom('users').execute();

        // Seed users
        console.log('Seeding users...');
        const hashedPassword = await bcrypt.hash('Test@123', 10);

        const users = [
            {
                name: 'Admin User',
                userName: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'John Doe',
                userName: 'johndoe',
                email: 'john@gmail.com',
                password: hashedPassword,
                role: 'user'
            },
            {
                name: 'Jane Smith',
                userName: 'janesmith',
                email: 'jane@gmail.com',
                password: hashedPassword,
                role: 'user'
            },
            {
                name: 'Bob Johnson',
                userName: 'bobjohnson',
                email: 'bob@gmail.com',
                password: hashedPassword,
                role: 'user'
            },
            {
                name: 'Alice Williams',
                userName: 'alicewilliams',
                email: 'alice@gmail.com',
                password: hashedPassword,
                role: 'user'
            }
        ];

        const insertedUsers: { id: number, name: string, email: string }[] = [];
        for (const user of users) {
            const result = await db.insertInto('users').values(user).executeTakeFirst();
            if (result && result.insertId) {
                insertedUsers.push({
                    id: Number(result.insertId),
                    name: user.name,
                    email: user.email
                });
            }
        }

        // Get current date (20/06/2025)
        const currentDate = new Date('2025-06-20');
        
        // Seed projects
        console.log('Seeding projects...');
        const projects = [
            {
                name: 'Website Redesign',
                description: 'Complete redesign of the company website with modern UI/UX',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15), // May 15, 2025
                endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 30), // August 30, 2025
                status: 'In-Progress',
                ownerId: insertedUsers[0].id,
                totalHours: 120.5
            },
            {
                name: 'Mobile App Development',
                description: 'Develop a cross-platform mobile app for iOS and Android',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // June 1, 2025
                endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 15), // September 15, 2025
                status: 'Pending',
                ownerId: insertedUsers[1].id,
                totalHours: 85.25
            },
            {
                name: 'Database Migration',
                description: 'Migrate from legacy database to new cloud-based solution',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 10), // April 10, 2025
                endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 10), // July 10, 2025
                status: 'Completed',
                ownerId: insertedUsers[2].id,
                totalHours: 210.75
            }
        ];

        const insertedProjects: { id: number, name: string }[] = [];
        for (const project of projects) {
            const result = await db.insertInto('projects').values(project).executeTakeFirst();
            if (result && result.insertId) {
                insertedProjects.push({
                    id: Number(result.insertId),
                    name: project.name
                });
            }
        }

        // Seed project members
        console.log('Seeding project members...');
        const projectMembers = [
            { projectId: insertedProjects[0].id, userId: insertedUsers[1].id },
            { projectId: insertedProjects[0].id, userId: insertedUsers[2].id },
            { projectId: insertedProjects[0].id, userId: insertedUsers[3].id },
            { projectId: insertedProjects[1].id, userId: insertedUsers[0].id },
            { projectId: insertedProjects[1].id, userId: insertedUsers[2].id },
            { projectId: insertedProjects[1].id, userId: insertedUsers[4].id },
            { projectId: insertedProjects[2].id, userId: insertedUsers[0].id },
            { projectId: insertedProjects[2].id, userId: insertedUsers[1].id },
            { projectId: insertedProjects[2].id, userId: insertedUsers[3].id }
        ];

        for (const member of projectMembers) {
            await db.insertInto('projectmembers').values(member).execute();
        }

        // Seed tasks
        console.log('Seeding tasks...');
        const tasks = [
            {
                subject: 'Design Homepage Mockup',
                description: 'Create mockups for the new homepage design',
                status: 'Done',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20), // May 20, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), // June 5, 2025
                totalTimeSpent: 28800, // 8 hours in seconds
                ownerId: insertedUsers[0].id,
                projectId: insertedProjects[0].id
            },
            {
                subject: 'Implement User Authentication',
                description: 'Set up secure user authentication system',
                status: 'In-Progress',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10), // June 10, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), // June 25, 2025
                totalTimeSpent: 43200, // 12 hours in seconds
                ownerId: insertedUsers[1].id,
                projectId: insertedProjects[0].id
            },
            {
                subject: 'Create API Documentation',
                description: 'Document all API endpoints and usage examples',
                status: 'Pending',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), // June 15, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5), // July 5, 2025
                totalTimeSpent: 0,
                ownerId: insertedUsers[2].id,
                projectId: insertedProjects[0].id
            },
            {
                subject: 'Design App UI',
                description: 'Create UI design for the mobile app',
                status: 'In-Progress',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), // June 5, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 10), // July 10, 2025
                totalTimeSpent: 18000, // 5 hours in seconds
                ownerId: insertedUsers[1].id,
                projectId: insertedProjects[1].id
            },
            {
                subject: 'Implement Push Notifications',
                description: 'Set up push notification system for mobile app',
                status: 'Pending',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1), // July 1, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 20), // July 20, 2025
                totalTimeSpent: 0,
                ownerId: insertedUsers[2].id,
                projectId: insertedProjects[1].id
            },
            {
                subject: 'Database Schema Design',
                description: 'Design schema for the new database',
                status: 'Done',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 15), // April 15, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 5), // May 5, 2025
                totalTimeSpent: 36000, // 10 hours in seconds
                ownerId: insertedUsers[2].id,
                projectId: insertedProjects[2].id
            },
            {
                subject: 'Data Migration Script',
                description: 'Write script to migrate data from old to new database',
                status: 'Done',
                startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 10), // May 10, 2025
                dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10), // June 10, 2025
                totalTimeSpent: 72000, // 20 hours in seconds
                ownerId: insertedUsers[3].id,
                projectId: insertedProjects[2].id
            }
        ];

        const insertedTasks: { id: number, subject: string }[] = [];
        for (const task of tasks) {
            const result = await db.insertInto('tasks').values(task).executeTakeFirst();
            if (result && result.insertId) {
                insertedTasks.push({
                    id: Number(result.insertId),
                    subject: task.subject
                });
            }
        }

        // Seed task assignments
        console.log('Seeding task assignments...');
        const taskAssignments = [
            { taskId: insertedTasks[0].id, userId: insertedUsers[1].id },
            { taskId: insertedTasks[0].id, userId: insertedUsers[2].id },
            { taskId: insertedTasks[1].id, userId: insertedUsers[1].id },
            { taskId: insertedTasks[1].id, userId: insertedUsers[3].id },
            { taskId: insertedTasks[2].id, userId: insertedUsers[2].id },
            { taskId: insertedTasks[3].id, userId: insertedUsers[0].id },
            { taskId: insertedTasks[3].id, userId: insertedUsers[4].id },
            { taskId: insertedTasks[4].id, userId: insertedUsers[2].id },
            { taskId: insertedTasks[5].id, userId: insertedUsers[0].id },
            { taskId: insertedTasks[5].id, userId: insertedUsers[2].id },
            { taskId: insertedTasks[6].id, userId: insertedUsers[1].id },
            { taskId: insertedTasks[6].id, userId: insertedUsers[3].id }
        ];

        for (const assignment of taskAssignments) {
            await db.insertInto('task_assignments').values(assignment).execute();
        }

        // Seed task checklists
        console.log('Seeding task checklists...');
        const taskChecklists = [
            {
                taskId: insertedTasks[0].id,
                item: 'Create wireframes',
                isCompleted: true
            },
            {
                taskId: insertedTasks[0].id,
                item: 'Design mobile version',
                isCompleted: true
            },
            {
                taskId: insertedTasks[0].id,
                item: 'Get client approval',
                isCompleted: false
            },
            {
                taskId: insertedTasks[1].id,
                item: 'Research authentication libraries',
                isCompleted: true
            },
            {
                taskId: insertedTasks[1].id,
                item: 'Implement login/register',
                isCompleted: true
            },
            {
                taskId: insertedTasks[1].id,
                item: 'Add password reset functionality',
                isCompleted: false
            },
            {
                taskId: insertedTasks[1].id,
                item: 'Test security vulnerabilities',
                isCompleted: false
            },
            {
                taskId: insertedTasks[3].id,
                item: 'Design app icon',
                isCompleted: true
            },
            {
                taskId: insertedTasks[3].id,
                item: 'Create component library',
                isCompleted: false
            },
            {
                taskId: insertedTasks[5].id,
                item: 'Define tables and relationships',
                isCompleted: true
            },
            {
                taskId: insertedTasks[5].id,
                item: 'Optimize for performance',
                isCompleted: true
            },
            {
                taskId: insertedTasks[6].id,
                item: 'Write data validation',
                isCompleted: true
            },
            {
                taskId: insertedTasks[6].id,
                item: 'Test migration with sample data',
                isCompleted: true
            },
            {
                taskId: insertedTasks[6].id,
                item: 'Create rollback script',
                isCompleted: true
            }
        ];

        for (const checklist of taskChecklists) {
            await db.insertInto('taskchecklists').values(checklist).execute();
        }

        // Seed time logs
        console.log('Seeding time logs...');
        const timeLogs = [
            {
                name: 'Homepage Design Work',
                description: 'Working on homepage mockups',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 25, 9, 0), // May 25, 2025, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 25, 13, 0), // May 25, 2025, 1:00 PM
                userId: insertedUsers[1].id,
                projectId: insertedProjects[0].id,
                taskId: insertedTasks[0].id,
                timeSpent: 14400, // 4 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 25)
            },
            {
                name: 'Homepage Design Revisions',
                description: 'Revising homepage mockups based on feedback',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 28, 14, 0), // May 28, 2025, 2:00 PM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 28, 18, 0), // May 28, 2025, 6:00 PM
                userId: insertedUsers[1].id,
                projectId: insertedProjects[0].id,
                taskId: insertedTasks[0].id,
                timeSpent: 14400, // 4 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 28)
            },
            {
                name: 'Auth Research',
                description: 'Researching authentication libraries',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 10, 0), // June 12, 2025, 10:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 15, 0), // June 12, 2025, 3:00 PM
                userId: insertedUsers[1].id,
                projectId: insertedProjects[0].id,
                taskId: insertedTasks[1].id,
                timeSpent: 18000, // 5 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12)
            },
            {
                name: 'Auth Implementation',
                description: 'Implementing user authentication',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 9, 0), // June 15, 2025, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 16, 0), // June 15, 2025, 4:00 PM
                userId: insertedUsers[3].id,
                projectId: insertedProjects[0].id,
                taskId: insertedTasks[1].id,
                timeSpent: 25200, // 7 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)
            },
            {
                name: 'App UI Design',
                description: 'Designing mobile app UI',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 8, 0), // June 8, 2025, 8:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 13, 0), // June 8, 2025, 1:00 PM
                userId: insertedUsers[0].id,
                projectId: insertedProjects[1].id,
                taskId: insertedTasks[3].id,
                timeSpent: 18000, // 5 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8)
            },
            {
                name: 'Database Schema Design',
                description: 'Designing database schema',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 20, 9, 0), // April 20, 2025, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 20, 19, 0), // April 20, 2025, 7:00 PM
                userId: insertedUsers[2].id,
                projectId: insertedProjects[2].id,
                taskId: insertedTasks[5].id,
                timeSpent: 36000, // 10 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 20)
            },
            {
                name: 'Migration Script - Day 1',
                description: 'Writing data migration scripts',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15, 8, 0), // May 15, 2025, 8:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15, 16, 0), // May 15, 2025, 4:00 PM
                userId: insertedUsers[3].id,
                projectId: insertedProjects[2].id,
                taskId: insertedTasks[6].id,
                timeSpent: 28800, // 8 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15)
            },
            {
                name: 'Migration Script - Day 2',
                description: 'Testing and optimizing migration scripts',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 16, 9, 0), // May 16, 2025, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 16, 21, 0), // May 16, 2025, 9:00 PM
                userId: insertedUsers[3].id,
                projectId: insertedProjects[2].id,
                taskId: insertedTasks[6].id,
                timeSpent: 43200, // 12 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 16)
            },
            {
                name: 'Recent Work Session',
                description: 'Working on current tasks',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 9, 0), // Yesterday, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 17, 0), // Yesterday, 5:00 PM
                userId: insertedUsers[1].id,
                projectId: insertedProjects[0].id,
                taskId: insertedTasks[1].id,
                timeSpent: 28800, // 8 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1) // Yesterday
            },
            {
                name: 'Today Morning Session',
                description: 'Working on current sprint tasks',
                startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0), // Today, 9:00 AM
                endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 30), // Today, 12:30 PM
                userId: insertedUsers[2].id,
                projectId: insertedProjects[1].id,
                taskId: insertedTasks[3].id,
                timeSpent: 12600, // 3.5 hours in seconds
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
            }
        ];

        for (const timeLog of timeLogs) {
            await db.insertInto('timelogs').values(timeLog).execute();
        }

        // Seed notifications
        console.log('Seeding notifications...');
        const notifications = [
            {
                userId: insertedUsers[1].id,
                type: 'TASK_ASSIGNED',
                title: 'New Task Assignment',
                message: 'You have been assigned to "Design Homepage Mockup"',
                entityType: 'TASK',
                entityId: insertedTasks[0].id,
                initiatorId: insertedUsers[0].id,
                isRead: true,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20) // May 20, 2025
            },
            {
                userId: insertedUsers[2].id,
                type: 'TASK_ASSIGNED',
                title: 'New Task Assignment',
                message: 'You have been assigned to "Design Homepage Mockup"',
                entityType: 'TASK',
                entityId: insertedTasks[0].id,
                initiatorId: insertedUsers[0].id,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20) // May 20, 2025
            },
            {
                userId: insertedUsers[0].id,
                type: 'TASK_COMPLETED',
                title: 'Task Completed',
                message: 'The task "Design Homepage Mockup" has been completed',
                entityType: 'TASK',
                entityId: insertedTasks[0].id,
                initiatorId: insertedUsers[1].id,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5) // June 5, 2025
            },
            {
                userId: insertedUsers[2].id,
                type: 'PROJECT_MEMBER_ADDED',
                title: 'Added to Project',
                message: 'You have been added to the project "Website Redesign"',
                entityType: 'PROJECT',
                entityId: insertedProjects[0].id,
                initiatorId: insertedUsers[0].id,
                isRead: true,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15) // May 15, 2025
            },
            {
                userId: insertedUsers[0].id,
                type: 'TASK_UPDATED',
                title: 'Task Updated',
                message: 'The task "Implement User Authentication" has been updated',
                entityType: 'TASK',
                entityId: insertedTasks[1].id,
                initiatorId: insertedUsers[1].id,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15) // June 15, 2025
            },
            {
                userId: insertedUsers[1].id,
                type: 'TASK_DEADLINE_APPROACHING',
                title: 'Task Deadline Approaching',
                message: 'The task "Implement User Authentication" is due in 5 days',
                entityType: 'TASK',
                entityId: insertedTasks[1].id,
                initiatorId: null,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1) // Yesterday
            },
            {
                userId: insertedUsers[3].id,
                type: 'TASK_DEADLINE_APPROACHING',
                title: 'Task Deadline Approaching',
                message: 'The task "Implement User Authentication" is due in 5 days',
                entityType: 'TASK',
                entityId: insertedTasks[1].id,
                initiatorId: null,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1) // Yesterday
            },
            {
                userId: insertedUsers[4].id,
                type: 'TASK_ASSIGNED',
                title: 'New Task Assignment',
                message: 'You have been assigned to "Design App UI"',
                entityType: 'TASK',
                entityId: insertedTasks[3].id,
                initiatorId: insertedUsers[1].id,
                isRead: false,
                createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) // Today
            }
        ];

        for (const notification of notifications) {
            await db.insertInto('notifications').values(notification).execute();
        }

        // Seed notification preferences
        console.log('Seeding notification preferences...');
        const notificationTypes = ['TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_UPDATED', 'PROJECT_MEMBER_ADDED', 'PROJECT_COMPLETED', 'TASK_DEADLINE_APPROACHING'];

        for (const user of insertedUsers) {
            for (const type of notificationTypes) {
                await db.insertInto('notification_preferences')
                    .values({
                        userId: user.id,
                        type,
                        enabled: true
                    })
                    .execute();
            }
        }

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

/**
 * Command line interface for running the seed script
 */
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seeding completed, exiting...');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
} 