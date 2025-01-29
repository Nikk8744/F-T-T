import { Request, Response } from "express";
import { projectServices } from "../services/Project.service";
import { createProjectSchema } from "../schemas/Project.schema";

// interface ICreateProject extends Request {
//     user?: {
//       id: number;
//       role: string;
//       // ... other user properties
//     };
//   }

const createProject = async (req: /*ICreateProject*/Request, res: Response): Promise<void> => {
    const validatedProject = createProjectSchema.parse(req.body);
    const userId = Number(req.user?.id);
    
    
    if (!userId) {
        res.status(401).json({ msg: "Unauthorized, please login first." });
        return;
    }
    // Validate and parse the request body with your schema
    const startDate = new Date(validatedProject.startDate);  // Convert to Date
    const endDate = new Date(validatedProject.endDate); 
    const projectData = {
        ...validatedProject, 
        userId,
        startDate,
        endDate,
        description: validatedProject.description || "",

    };
    const project = await projectServices.createProject(projectData);
    res.status(200).json({
        msg: "Project created successfully!!!",
        project: project,
    })
};

export {
    createProject
}