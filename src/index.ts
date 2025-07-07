import dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { setupWebsocket } from './utils/websocket';
import { initializeScheduledJobs } from './crons/scheduler';

const app = express();
const server = http.createServer(app);

// It tells Express to trust the 'X-Forwarded-Proto' header
// from the Render reverse proxy. '1' means it will trust the first hop.
app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT || '5000', 10);
// Make io available globally
declare global {
    var io: any;
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
                // Add other user properties as needed
            };
        }
    }
}


// Setup middleware first
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // exposedHeaders: ['Set-Cookie'] // 'Set-Cookie' cannot be exposed due to browser security restrictions
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Setup WebSocket after middleware
const io = setupWebsocket(server);

global.io = io;

app.get("/", (req, res) => {
    res.send("Hello broo")
});

// import routes
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import projectMemberRoutes from './routes/projectMembers.routes';
import taskRoutes from './routes/task.routes';
import logRoutes from './routes/log.routes';
import itemRoutes from './routes/taskChecklist.routes';
import taskAssignmentRoutes from './routes/taskAssignment.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';

// use routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/projectMember', projectMemberRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/taskAssignment', taskAssignmentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port: http://localhost:${PORT}`);

    // Initialize scheduled jobs after server has started
    initializeScheduledJobs();
    console.log('Scheduled jobs initialized');
});