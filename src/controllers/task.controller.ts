import { Request, Response } from "express";
import { TaskCreateSchema, TaskUpdateSchema } from "../schemas/Task.schema";
import { taskServices } from "../services/Task.service";
import { ZodError } from "zod";
import { projectServices } from "../services/Project.service";
import { taskAssignmentServices } from "../services/TaskAssignment.service";
import { notificationService } from "../services/Notification.service";

const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = Number(req.params.projectId)
        const data = req.body;
        const validateData = TaskCreateSchema.parse(data);
        const userId = Number(req.user?.id);
    
        // Create the task with the user as owner
        const task = await taskServices.createTask(projectId, validateData, userId);
        
        if(!task){
            res.status(404).json({ message: "Task not created" });
            return;
        }
        
        // // Assign users to the task if assigneeIds are provided in the request body
        // const assigneeIds = req.body.assigneeIds;
        // if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
        //     for (const assigneeId of assigneeIds) {
        //         await taskAssignmentServices.assignTaskToUser(task.id, assigneeId);
        //         // Send notification to the assignee
        //         await notificationService.notifyTaskAssigned(task.id, task, assigneeId, userId);
        //     }
        // }
        
        // // Send notifications
        // await notificationService.notifyTaskCreated(task.id, task, userId);
        
        // // Get the task with all its details
        // const taskWithDetails = await taskServices.getTaskById(task.id);
        
        res.status(200).json({
            message: "Task created successfully",
            // task: taskWithDetails,
            task: task
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
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
            return;
        }
    
        res.status(200).json({
            msg: "Task retrieved successfully",
            task
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};

const deleteTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
        res.status(400).json({ msg: "Invalid task id" });
        return;
    }
    try {
        const deletedTask = await taskServices.deleteTask(taskId);
        if(!deletedTask){
            res.status(404).json({ message: "Task not found" });
            return;
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Task deletion failed' });
    }
};

const updateTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
        res.status(400).json({ msg: "Invalid task id" });
        return;
    }

    try {
        const validateData = TaskUpdateSchema.parse(req.body);
        const userId = Number(req.user?.id);
        
        // Get the task before update to check status changes
        const taskBeforeUpdate = await taskServices.getTaskById(taskId);
        if (!taskBeforeUpdate) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        
        // Update the task basic info
        const updatedTask = await taskServices.updateTask(taskId, validateData);
        if(!updatedTask){
            res.status(404).json({ message: "Task not found" });
            return;
        }
        
        // // Handle assignees if specified in request body
        // const assigneeIds = req.body.assigneeIds;
        // if (assigneeIds && Array.isArray(assigneeIds)) {
        //     // Get current assignees
        //     const previousAssignees = await taskAssignmentServices.getTaskAssignees(taskId);
        //     const previousAssigneeIds = previousAssignees.map(a => a.id);
            
        //     // Determine which assignees to add and which to remove
        //     const assigneesToAdd = assigneeIds.filter(id => !previousAssigneeIds.includes(id));
        //     const assigneesToRemove = previousAssigneeIds.filter(id => !assigneeIds.includes(id));
            
        //     // Add new assignees
        //     for (const newUserId of assigneesToAdd) {
        //         await taskAssignmentServices.assignTaskToUser(taskId, newUserId);
        //         // Notify new assignees
        //         await notificationService.notifyTaskAssigned(taskId, updatedTask, newUserId, userId);
        //     }
            
        //     // Remove assignees no longer in the list
        //     for (const removeUserId of assigneesToRemove) {
        //         await taskAssignmentServices.unassignUserFromTask(taskId, removeUserId);
        //     }
        // }
        
        // // Send notifications based on changes
        
        // // Check if task was marked as completed
        // if (validateData.status === 'Done' && taskBeforeUpdate.status !== 'Done') {
        //     await notificationService.notifyTaskCompleted(taskId, updatedTask, userId);
        // } else {
        //     // Otherwise, just notify about the update
        //     await notificationService.notifyTaskUpdated(taskId, updatedTask, userId);
        // }
        
        // // Get the task with updated details
        // const taskWithDetails = await taskServices.getTaskById(taskId);
    
        res.status(200).json({
            msg: "Task updated successfully",
            // task: taskWithDetails
            task: updatedTask
        });
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
};

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
};

const getAllTasks = async (req: Request, res: Response) => {
    try {
        const allTasks = await taskServices.getAllTasks();
        if(!allTasks || allTasks.length === 0){
            res.status(404).json({ message: "No tasks found" });
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
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

const getUsersTasks = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params?.userId || req.user?.id);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ msg: "Invalid user id" });
            return;
        }
        const tasks = await taskServices.getUserTasks(userId);
        res.status(200).json({
            msg: "Tasks retrieved successfully",
            tasks: tasks,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch user tasks' });
    }
};

export {
    createTask,
    getTask,
    deleteTask,
    updateTask,
    getProjectTasks,
    getAllTasks,
    getUsersTasks,
};