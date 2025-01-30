import dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cookieParser from 'cookie-parser';

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

app.get("/", (req, res) => {
    res.send("Hello broo")
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

// import routes
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import projectMemberRoutes from './routes/projectMembers.routes';
import taskRoutes from './routes/task.routes';

// use routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/projectMember', projectMemberRoutes);
app.use('/api/v1/tasks', taskRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Server running on port: http://localhost:${process.env.PORT}`);
})