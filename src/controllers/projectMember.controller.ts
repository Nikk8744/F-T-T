import { Request, Response } from "express";
import { addMemberSchema } from "../schemas/ProjectMember.schema"
import { projectMemberServices } from "../services/ProjectMember.service";
import { ZodError } from "zod";

const addMemberToProject = async (req: Request, res: Response) => {
    try {
        const validateData = addMemberSchema.parse(req.body);
        const { projectId, userId  } = validateData;
        const currentUser = Number(req.user?.id)
    
        const result = await projectMemberServices.addMembersToProject(projectId, currentUser, userId);
        if (!result) {
            res.status(400).json({ msg: 'Failed to add member to project' });
        }
        
        res.status(200).json(result);
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

const removeMember = async (req: Request, res: Response): Promise<void> => {

    const { projectId, userId } = req.body;
    const ownerId = Number(req.user?.id)
    if (!ownerId) {
        res.status(401).json({ msg: 'Unauthorized' });
        return;
    }

    try {
        const result = await projectMemberServices.removeMembersFromProject(projectId, userId);
        if (!result) {
            res.status(400).json({ msg: 'Failed to remove member from project' });
            return;
        }
    
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ msg: (error as Error).message });
    }
}

const getAllMembersOfAProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if(!projectId){
        res.status(400).json({ msg: 'Invalid project id' });
        return;
    }

    const allMembers = await projectMemberServices.getAllMembersOfAProject(projectId, /*Number(req.user?.id)*/  );
    if (!allMembers) {
        res.status(400).json({ msg: 'Failed to get all members of project' });
        return;
    }

    res.status(200).json({
        members: allMembers,
        msg: 'All members of project retrieved successfully',
    })
};


const getAllProjectsAUserIsMemberOf = async (req: Request, res: Response) => {
    
    const userId = Number(req.user?.id)
    if(!userId){
        res.status(401).json({msg: "Unauthorized"});
        return;
    }
    
    const allProjects = await projectMemberServices.getAllProjectsAUserIsMemberOf(userId);
    if (!allProjects || !allProjects.length) {
        res.status(400).json({ msg: 'No projects found' });
        return;
    }
    res.status(200).json({
        projects: allProjects,
        msg: 'All projects a user is member of retrieved successfully',
    })
}

export {
    addMemberToProject,
    removeMember,
    getAllMembersOfAProject,
    getAllProjectsAUserIsMemberOf,
}