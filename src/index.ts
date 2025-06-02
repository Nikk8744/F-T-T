import dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';

// import routes
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import projectMemberRoutes from './routes/projectMembers.routes';
import taskRoutes from './routes/task.routes';
import logRoutes from './routes/log.routes';
import itemRoutes from './routes/taskChecklist.routes';
import taskAssignmentRoutes from './routes/taskAssignment.routes';

const app = express();

declare global {
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

// app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello broo")
});
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));



// use routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/projectMember', projectMemberRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/taskAssignment', taskAssignmentRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port: http://localhost:${process.env.PORT}`);
})