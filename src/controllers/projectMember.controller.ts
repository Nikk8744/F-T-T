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
}

export {
    addMemberToProject,
}