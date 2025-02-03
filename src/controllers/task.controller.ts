import { Request, Response } from "express";
import { TaskCreateSchema, TaskUpdateSchema } from "../schemas/Task.schema";
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
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
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
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch task' });
    }
}

const deleteTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
        res.status(400).json({ msg: "Invalid project id" });
        return;
    }
    try {
        const deletedTask = await taskServices.deleteTask(taskId);
        if(!deletedTask){
            res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Task deletion failed' });
    }
}

const updateTask = async (req: Request, res: Response) => {

    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
        res.status(400).json({ msg: "Invalid project id" });
        return;
    }

    try {
        const validateData = TaskUpdateSchema.parse(req.body);
    
        const updatedTask = await taskServices.updateTask(taskId, validateData);
        if(!updatedTask){
            res.status(404).json({ message: "Task not found" });
            return;
        }
    
        res.status(200).json({
            msg: "Task updated successfully",
            task: updatedTask
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ msg: "Internal Server Error" });
    }

}

const getProjectTasks = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        if (isNaN(projectId) || projectId <= 0) {
            res.status(400).json({ msg: "Invalid project id" });
            return;
        }
    
        const allTasks = await taskServices.getProjectTasks(projectId);
        if(!allTasks){
            res.status(404).json({ message: "Project not found" });
            return;
        }
    
        res.status(200).json({
            msg: "Tasks retrieved successfully",
            tasks: allTasks,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ msg: "Internal Server Error",  error });
    }
}

const getAllTasks = async (req: Request, res: Response) => {
    try {
        const allTasks = await taskServices.getAllTasks();
        if(!allTasks){
            res.status(404).json({ message: "No tasks found" });
        }
        res.status(200).json({
            msg: "Tasks retrieved successfully",
            ALL_tasks: allTasks,
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
}

const getUsersTasks = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params?.userId || req.user?.id);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ msg: "Invalid project id" });
            return;
        }
        const tasks = await taskServices.getUserTasks(userId);
        res.status(200).json({
            msg: "Tasks retrieved successfully",
            Users_tasks: tasks,
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user tasks' });
      }
}

export {
    createTask,
    getTask,
    deleteTask,
    updateTask,
    getProjectTasks,
    getAllTasks,
    getUsersTasks,
}