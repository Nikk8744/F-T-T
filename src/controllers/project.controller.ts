import { Request, Response } from "express";
import { projectServices } from "../services/Project.service";
import { createProjectSchema, updateProjectSchema } from "../schemas/Project.schema";
import { ZodError } from "zod";
import { notificationService } from "../services/Notification.service";
import { 
    sendSuccess, 
    sendNotFound, 
    sendError, 
    sendUnauthorized, 
    sendForbidden, 
    sendValidationError 
} from "../utils/apiResponse";

// interface ICreateProject extends Request {
//     user?: {
//       id: number;
//       role: string;
//       // ... other user properties
//     };
//   }

const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedProject = createProjectSchema.parse(req.body);
        const userId = Number(req.user?.id);

        if (!userId) {
            sendUnauthorized(res, "Unauthorized, please login first.");
            return;
        }
        // Validate and parse the request body with your schema
        const startDate = new Date(validatedProject.startDate);  // Convert to Date
        const endDate = new Date(validatedProject.endDate);
        
        // Check if start date is in the past
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
        
        if (startDate < currentDate) {
            sendValidationError(res, "Project start date cannot be in the past");
            return;
        }
        
        // Check if end date is before start date
        if (endDate < startDate) {
            sendValidationError(res, "Project end date cannot be before start date");
            return;
        }
        
        const projectData = {
            ...validatedProject,
            ownerId: userId,
            startDate,
            endDate,
            description: validatedProject.description || "",
        };
        const project = await projectServices.createProject(projectData);

        // Send notification about project creation
        if (project) {
            await notificationService.notifyTaskCreated(project.id, project, userId);
        }

        sendSuccess(res, project, "Project created successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const getProjectById = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (!projectId) {
        sendValidationError(res, "Invalid project id");
        return;
    }
    
    try {
        const project = await projectServices.getProjectById(projectId);

        if (!project) {
            sendNotFound(res, "Project not found");
            return;
        }

        sendSuccess(res, project, "Project found");
    } catch (error) {
        sendError(res, error);
    }
};

const updateProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (isNaN(projectId) || projectId <= 0) {
        sendValidationError(res, "Invalid project id");
        return;
    }

    try {
        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            sendNotFound(res, "Project not found");
            return;
        }

        const userId = Number(req.user?.id);
        const userRole = req.user?.role;

        // Check if the user is the owner or has Admin role
        if (project.ownerId !== userId && userRole !== "Admin") {
            sendForbidden(res, "You cannot update this project");
            return;
        }

        const validatedProject = updateProjectSchema.parse({ ...req.body, id: projectId });
        
        // Validate dates if they are being updated
        if (validatedProject.startDate || validatedProject.endDate) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
            
            const existingStartDate = new Date(project.startDate);
            const newStartDate = validatedProject.startDate ? new Date(validatedProject.startDate) : existingStartDate;
            const existingEndDate = new Date(project.endDate);
            const newEndDate = validatedProject.endDate ? new Date(validatedProject.endDate) : existingEndDate;
            
            // Only check if start date is in the past if it's being changed
            if (validatedProject.startDate && 
                newStartDate < currentDate && 
                newStartDate.getTime() !== existingStartDate.getTime()) {
                sendValidationError(res, "Project start date cannot be in the past");
                return;
            }
            
            // Check if end date is before start date
            if (newEndDate < newStartDate) {
                sendValidationError(res, "Project end date cannot be before start date");
                return;
            }
        }

        // Check if status is being updated to 'Completed'
        const isCompletingProject = validatedProject.status === 'Completed' && project.status !== 'Completed';

        const updatedData = {
            ...validatedProject,
            totalHours: validatedProject.totalHours !== undefined
                ? validatedProject.totalHours.toString()
                : undefined,
        };
        const updatedProject = await projectServices.updateProject(projectId, updatedData);
        if (!updatedProject) {
            sendNotFound(res, "Project not found");
            return;
        }

        // Send notification if project is being completed
        if (isCompletingProject) {
            console.log("Project completed notification sent");
            const notification = await notificationService.notifyProjectCompleted(projectId, updatedProject, userId);
            console.log("Notification sent:", notification);
            
            // Add completedAt field info in the success message
            sendSuccess(res, updatedProject, "Project marked as complete and completion date recorded");
            return;
        }

        sendSuccess(res, updatedProject, "Project updated successfully");
    } catch (error) {
        sendError(res, error);
    }
};

const deleteProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (isNaN(projectId) || projectId <= 0) {
        sendValidationError(res, "Invalid project id");
        return;
    }

    try {
        const userId = Number(req.user?.id);
        const userRole = req.user?.role;
        if (!userId) {
            sendUnauthorized(res, "Unauthorized, please login first.");
            return;
        }

        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            sendNotFound(res, "Project not found");
            return;
        }

        // Check if the user is the owner or has Admin role
        if (project.ownerId !== userId && userRole !== "Admin") {
            sendForbidden(res, "You cannot delete this project");
            return;
        }

        const deletedProject = await projectServices.deleteProject(projectId);
        sendSuccess(res, deletedProject, deletedProject.msg);
    } catch (error) {
        sendError(res, error);
    }
};

const getAllProjectsOfAUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.user?.id);
    if (!userId) {
        sendUnauthorized(res, "Unauthorized, please login first.");
        return;
    }

    try {
        const allProjects = await projectServices.getAllProjectsOfAUser(userId);
        if (!allProjects || allProjects.length === 0) {
            sendNotFound(res, "No projects found");
            return;
        }

        sendSuccess(res, allProjects, "All projects fetched successfully");
    } catch (error) {
        sendError(res, error);
    }
};

export {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getAllProjectsOfAUser,
};