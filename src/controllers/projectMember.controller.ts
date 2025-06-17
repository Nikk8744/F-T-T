import { Request, Response } from "express";
import { addMemberSchema } from "../schemas/ProjectMember.schema"
import { projectMemberServices } from "../services/ProjectMember.service";
import { ZodError } from "zod";
import { notificationService } from "../services/Notification.service";
import { projectServices } from "../services/Project.service";
import { 
    sendSuccess, 
    sendError, 
    sendValidationError, 
    sendUnauthorized,
    sendNotFound
} from "../utils/apiResponse";

const addMemberToProject = async (req: Request, res: Response) => {
    try {
        const validateData = addMemberSchema.parse(req.body);
        const { projectId, userId } = validateData;
        const currentUser = Number(req.user?.id);
    
        const result = await projectMemberServices.addMembersToProject(projectId, currentUser, userId);
        if (!result) {
            sendNotFound(res, 'Failed to add member to project');
            return;
        }
        
        // Get project details for notification
        const project = await projectServices.getProjectById(projectId);
        if (project) {
            // Send notification to the added user
            await notificationService.notifyUserAddedToProject(projectId, project, userId, currentUser);
        }
        
        sendSuccess(res, result, 'Member added to project successfully');
    } catch (error) {
        if (error instanceof ZodError) {
            sendValidationError(res, error.errors.map(e => e.message).join(', '));
            return;
        }
        sendError(res, error);
    }
};

const removeMember = async (req: Request, res: Response): Promise<void> => {
    const { projectId, userId } = req.body;
    const ownerId = Number(req.user?.id);
    if (!ownerId) {
        sendUnauthorized(res, 'Unauthorized');
        return;
    }

    try {
        const result = await projectMemberServices.removeMembersFromProject(projectId, userId);
        if (!result) {
            sendNotFound(res, 'Failed to remove member from project');
            return;
        }
    
        sendSuccess(res, result, 'Member removed from project successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const getAllMembersOfAProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    if (!projectId) {
        sendValidationError(res, 'Invalid project ID');
        return;
    }

    try {
        const allMembers = await projectMemberServices.getAllMembersOfAProject(projectId, Number(req.user?.id));
        if (!allMembers) {
            sendNotFound(res, 'Failed to get all members of project');
            return;
        }
    
        sendSuccess(res, allMembers, 'All members of project retrieved successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const getAllProjectsAUserIsMemberOf = async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    if (!userId) {
        sendUnauthorized(res, 'Unauthorized');
        return;
    }
    
    try {
        const allProjects = await projectMemberServices.getAllProjectsAUserIsMemberOf(userId);
        if (!allProjects || !allProjects.length) {
            sendNotFound(res, 'No projects found');
            return;
        }
        
        sendSuccess(res, allProjects, 'All projects a user is member of retrieved successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export {
    addMemberToProject,
    removeMember,
    getAllMembersOfAProject,
    getAllProjectsAUserIsMemberOf,
};