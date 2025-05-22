import { NextFunction, Request, Response } from "express";
import { projectServices } from "../services/Project.service";

export const isProjectOwner = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const incomingUserId = Number(req.user?.id);
        const projectId = Number(req.body.projectId || req.params.projectId);
    
        if (!incomingUserId) {
            res.status(401).json({ msg: "Unauthorized: Please log in first" });
            return;
        }
        if (!projectId) {
            res.status(400).json({ msg: "Project ID is required" });
            return;
        }
    
        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            res.status(404).json({ msg: "Project not found" });
            return;
        }
    
        if(project?.userId !== incomingUserId) {
            res.status(403).json({ msg: "Forbidden: Only the project owner can perform this action" });
            return;
        }
    
        next();
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error", error: (error as Error).message });
        return;
    }
}