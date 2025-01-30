import { Request, Response } from "express";
import { TaskCreateSchema } from "../schemas/Task.schema";
import { taskServices } from "../services/Task.service";
import { ZodError } from "zod";
import { projectServices } from "../services/Project.service";

const createTask = async (req: Request, res: Response) => {

    try {
        const projectId = Number(req.params.projectId)
        const validateData = TaskCreateSchema.parse(req.body);
        const userId = Number(req.user?.id);
    
        const task = await taskServices.createTask(projectId, validateData, userId);
        res.status(200).json({
            message: "Task created successfully",
            task,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
          }
          res.status(500).json({ error: 'Task creation failed' });
    }
};

const getTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    try {
        const task = await taskServices.getTaskById(taskId);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
        }
    
        res.status(200).json({
            msg: "Task retrived successfully",
            task
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
}

const deleteTask = async (req: Request, res: Response) => {}

const updateTask = async (req: Request, res: Response) => {}

const getProjectTasks = async (req: Request, res: Response) => {}

const getAllTasks = async (req: Request, res: Response) => {}

const getUsersTasks = async (req: Request, res: Response) => {}

export {
    createTask,
    getTask,
    deleteTask,
    updateTask,
    getProjectTasks,
    getAllTasks,
    getUsersTasks,
}