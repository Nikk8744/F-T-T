import { Request, Response } from "express";
import { TaskCreateSchema, TaskUpdateSchema } from "../schemas/Task.schema";
import { taskServices } from "../services/Task.service";
import { ZodError } from "zod";
import { projectServices } from "../services/Project.service";
import { taskAssignmentServices } from "../services/TaskAssignment.service";
import { notificationService } from "../services/Notification.service";
import { taskChecklistServices } from "../services/TaskChecklist.service";
import { 
    sendSuccess, 
    sendNotFound, 
    sendError, 
    sendUnauthorized, 
    sendForbidden, 
    sendValidationError 
} from "../utils/apiResponse";

const createTask = async (req: Request, res: Response): Promise<void> => {
    try {

        const projectId = Number(req.params.projectId)
        const data = req.body;
        const validateData = TaskCreateSchema.parse(data);
        const userId = Number(req.user?.id);
        
        // Check if due date is in the past
        if (validateData.dueDate && new Date(validateData.dueDate) < new Date()) {
            sendValidationError(res, "Due date cannot be in the past");
            return;
        }
    
        // Create the task with the user as owner (now includes checklist items)
        const task = await taskServices.createTask({ projectId, task: validateData, userId });
        
        if(!task) {
            sendNotFound(res, "Task not created");
            return;
        }
        
        // Assign users to the task if assigneeIds are provided in the request body
        const assigneeIds = req.body.assigneeIds;
        if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
            for (const assigneeId of assigneeIds) {
                await taskAssignmentServices.assignTaskToUser(task.id, assigneeId);
                // Send notification to the assignee
                await notificationService.notifyTaskAssigned(task.id, task, assigneeId, userId);
            }
        }
        
        // Send notifications
        await notificationService.notifyTaskCreated(task.id, task, userId);
        
        // Get the task with all its details including checklist items
        const taskWithDetails = await taskServices.getTaskById(task.id);
        const checklistItems = await taskChecklistServices.getTaskChecklist(task.id);
        
        // Include checklist items in the response
        const responseData = {
            ...taskWithDetails,
            checklistItems
        };        
        sendSuccess(res, responseData, "Task created successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const getTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    if (!taskId) {
        sendValidationError(res, "Invalid task id");
        return;
    }

    try {
        const task = await taskServices.getTaskById(taskId);
        if (!task) {
            sendNotFound(res, "Task not found");
            return;
        }
    
        sendSuccess(res, task, "Task retrieved successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const deleteTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    const userId = Number(req.user?.id);
    
    if (isNaN(taskId) || taskId <= 0) {
        sendValidationError(res, "Invalid task id");
        return;
    }

    try {
        const deletedTask = await taskServices.deleteTask(taskId);
        // const deletedTask = await taskServices.deleteTask(taskId, userId);
        if(!deletedTask) {
            sendNotFound(res, "Task not found");
            return;
        }
        sendSuccess(res, null, "Task deleted successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const updateTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);
    const userId = Number(req.user?.id);
    
    if (isNaN(taskId) || taskId <= 0) {
        sendValidationError(res, "Invalid task id");
        return;
    }

    try {
        const validateData = TaskUpdateSchema.parse(req.body);
        
        // Check if due date is in the past
        if (validateData.dueDate && new Date(validateData.dueDate) < new Date()) {
            sendValidationError(res, "Due date cannot be in the past");
            return;
        }
        
        // Get the task before update to check status changes
        const taskBeforeUpdate = await taskServices.getTaskById(taskId);
        if (!taskBeforeUpdate) {
            sendNotFound(res, "Task not found");
            return;
        }
        
        // Update the task basic info
        const updatedTask = await taskServices.updateTask(taskId, validateData, userId);
        if(!updatedTask) {
            sendNotFound(res, "Task not found");
            return;
        }
        
        // Handle assignees if specified in request body
        const assigneeIds = req.body.assigneeIds;
        if (assigneeIds && Array.isArray(assigneeIds)) {
            // Get current assignees
            const previousAssignees = await taskAssignmentServices.getTaskAssignees(taskId);
            const previousAssigneeIds = previousAssignees.map(a => a.id);
            
            // Determine which assignees to add and which to remove
            const assigneesToAdd = assigneeIds.filter(id => !previousAssigneeIds.includes(id));
            const assigneesToRemove = previousAssigneeIds.filter(id => !assigneeIds.includes(id));
            
            // Add new assignees
            for (const newUserId of assigneesToAdd) {
                await taskAssignmentServices.assignTaskToUser(taskId, newUserId);
                // Notify new assignees
                await notificationService.notifyTaskAssigned(taskId, updatedTask, newUserId, userId);
            }
            
            // Remove assignees no longer in the list
            for (const removeUserId of assigneesToRemove) {
                await taskAssignmentServices.unassignUserFromTask(taskId, removeUserId);
            }
        }
        
        // Send notifications based on changes
        
        // Check if task was marked as completed
        if (validateData.status === 'Done' && taskBeforeUpdate.status !== 'Done') {
            await notificationService.notifyTaskCompleted(taskId, updatedTask, userId);
            
            // Add completedAt field info in the success message
            const taskWithDetails = await taskServices.getTaskById(taskId);
            sendSuccess(res, taskWithDetails, "Task marked as complete and completion date recorded");
            return;
        } else {
            // Otherwise, just notify about the update
            await notificationService.notifyTaskUpdated(taskId, updatedTask, userId);
            
            // Get the task with updated details
            const taskWithDetails = await taskServices.getTaskById(taskId);
            sendSuccess(res, taskWithDetails, "Task updated successfully");
        }
    } catch (error) {
        sendError(res, error);
    }
};

const getProjectTasks = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        // const userId = Number(req.user?.id);
        
        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, "Invalid project id");
            return;
        }
    
        const allTasks = await taskServices.getProjectTasks(projectId);
        if(!allTasks) {
            sendNotFound(res, "Project not found");
            return;
        }
    
        sendSuccess(res, allTasks, "Tasks retrieved successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const getAllTasks = async (req: Request, res: Response) => {
    try {
        const allTasks = await taskServices.getAllTasks();
        if(!allTasks || allTasks.length === 0) {
            sendNotFound(res, "No tasks found");
            return;
        }
        sendSuccess(res, allTasks, "Tasks retrieved successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const getUsersTasks = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params?.userId || req.user?.id);
        if (isNaN(userId) || userId <= 0) {
            sendValidationError(res, "Invalid user id");
            return;
        }
        const tasks = await taskServices.getUserTasks(userId);
        sendSuccess(res, tasks, "Tasks retrieved successfully");
    } catch (error) {
        sendError(res, error);
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