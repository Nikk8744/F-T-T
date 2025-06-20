# 🚀 TRACKSY API  - Freelance Task Tracker API

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-green.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-brightgreen.svg)](https://socket.io/)
[![Kysely](https://img.shields.io/badge/Kysely-0.27+-yellow.svg)](https://kysely.dev/)

A robust TypeScript-based API for freelancers and teams to manage projects, tasks, and collaboration with real-time notifications and comprehensive reporting.

## 📋 Table of Contents

- [🚀 TRACKSY API  - Freelance Task Tracker API](#-tracksy-api----freelance-task-tracker-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🏗 Architecture](#-architecture)
  - [🛠 Tech Stack](#-tech-stack)
  - [📚 API Documentation](#-api-documentation)
    - [User Management](#user-management)
    - [Project Management](#project-management)
    - [Task Management](#task-management)
    - [Project Members](#project-members)
    - [Reporting](#reporting)
  - [🔌 WebSocket Integration](#-websocket-integration)
  - [🔔 Notification System](#-notification-system)
  - [📊 Reporting Features](#-reporting-features)
  - [🗄 Database Schema](#-database-schema)
    - [Tables](#tables)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [🔧 Environment Variables](#-environment-variables)
  - [⚙️ Development Commands](#️-development-commands)
  - [🔮 Future Enhancements](#-future-enhancements)
  - [🤝 Contributing](#-contributing)
  - [📦 Migration Tools](#-migration-tools)
  - [🧩 Services and Controllers](#-services-and-controllers)
    - [Why Separate Them?](#why-separate-them)

## ✨ Features

- **🔐 User Authentication & Authorization**: Secure JWT-based authentication
- **📂 Project Management**: Create, update, and manage projects
- **📝 Task Management**: Assign, track, and complete tasks
- **👥 Team Collaboration**: Add members to projects with specific roles
- **📊 Comprehensive Reporting**: Generate detailed project and task reports
- **📊 PDF Export**: Download reports in PDF format
- **🔔 Real-time Notifications**: WebSocket-based notification system
- **⏰ Deadline Tracking**: Automated alerts for approaching and missed deadlines
- **📱 RESTful API**: Well-structured endpoints for all features

## 🏗 Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── config/         # Database and app configuration
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API endpoints
├── middlewares/    # Request processors
├── utils/          # Helper functions
├── crons/          # Scheduled tasks
├── migrations/     # Database migrations
├── schemas/        # Validation schemas
└── db/             # Database models and types
```

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL with Kysely (SQL query builder)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for WebSocket communication
- **Validation**: Zod schema validation
- **Scheduling**: Node-cron for scheduled tasks
- **Documentation**: Express API endpoints
- **PDF Generation**: PDFKit for report generation

## 📚 API Documentation

### User Management
- `POST /api/v1/user/register`: Register a new user
- `POST /api/v1/user/login`: Authenticate a user
- `GET /api/v1/user/profile`: Get user profile

### Project Management
- `GET /api/v1/project`: List all projects
- `POST /api/v1/project`: Create a new project
- `GET /api/v1/project/:id`: Get project details
- `PUT /api/v1/project/:id`: Update project
- `DELETE /api/v1/project/:id`: Delete project

### Task Management
- `GET /api/v1/tasks`: List all tasks
- `POST /api/v1/tasks`: Create a new task
- `GET /api/v1/tasks/:id`: Get task details
- `PUT /api/v1/tasks/:id`: Update task
- `DELETE /api/v1/tasks/:id`: Delete task

### Project Members
- `GET /api/v1/projectMember/:projectId`: List project members
- `POST /api/v1/projectMember`: Add member to project
- `DELETE /api/v1/projectMember/:id`: Remove member from project

### Reporting
- `GET /api/v1/reports/project/:projectId/summary`: Get project summary
- `GET /api/v1/reports/tasks/status`: Get task status report
- `GET /api/v1/reports/tasks/overdue`: Get overdue tasks report
- `GET /api/v1/reports/tasks/pdf`: Download task report as PDF

## 🔌 WebSocket Integration

Real-time features are implemented using Socket.IO:

```javascript
// Client-side connection example
const socket = io.connect('http://localhost:<PORT>', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});

// Listen for unread count updates
socket.on('unreadNotificationsCount', ({ count }) => {
  console.log('Unread notifications:', count);
});
```

## 🔔 Notification System

The notification system keeps users informed about important events:

- Task created, updated, completed, assigned
- Project created, updated, completed
- User added to project
- Deadline approaching/missed

Notifications are stored in the database and delivered in real-time via WebSockets.

## 📊 Reporting Features

Generate comprehensive reports on:

- Project summary with completion percentage
- Task breakdown by status
- Team workload and allocation
- Risk assessment with overdue and approaching deadlines
- Task status distribution
- Task completion trends over time

All reports can be exported as PDF documents.

## 🗄 Database Schema

### Tables

- `users`: User accounts and authentication
- `projects`: Project details and metadata
- `tasks`: Individual tasks within projects
- `logs`: Activity logs for auditing
- `projectmembers`: User-project relationships
- `task_assignments`: User-task assignments
- `task_checklists`: Checklist items for tasks
- `notifications`: System notifications

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL database
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/freelance-tt-api.git
cd freelance-tt-api
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Configure environment variables (see below)

4. Run database migrations
```bash
npm run migrateAll
```

5. (Optional) Seed the database with test data
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=freelance_tt
```

## ⚙️ Development Commands

- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Run the compiled application
- `npm run dev`: Run with ts-node for development
- `npm run server`: Run with nodemon for development
- `npm run migrateAll`: Run all database migrations
- `npm run codegen`: Generate TypeScript types from database schema
- `npm run check-deadlines`: Manually check task deadlines
- `npm run seed`: Populate database with test data

## 🔮 Future Enhancements

- [ ] Cron job for checking due dates and sending notifications
- [ ] Enhanced project access for members
- [ ] Caching implementation for performance
- [ ] Improved TypeScript types and interfaces
- [ ] Database indexing for optimization
- [ ] Rate-limiting and throttling
- [ ] Automated testing suite
- [ ] Mobile application integration
- [ ] Advanced analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📦 Migration Tools

Several tools can be used for database migrations:

- Kysely migration (built-in with Kysely)
- Knex migration (recommended over Kysely's built-in migration tool)
- Sequelize migration
- TypeORM migration
- Prisma migration

## 🧩 Services and Controllers

### Why Separate Them?

Controllers are responsible for handling HTTP-specific tasks:
- Getting data from requests
- Validating input
- Sending responses

Services handle the application's business logic:
- Interacting with the database
- Performing calculations
- Operations not tied to the web layer

This separation allows reusing services in different parts of the application without duplicating code.

---

Built with ❤️ for freelancers and teams


