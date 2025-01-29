import { Request, Response } from "express";
import { projectServices } from "../services/Project.service";
import { createProjectSchema, updateProjectSchema } from "../schemas/Project.schema";
import { ZodError } from "zod";

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

const getProjectById = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (!projectId) {
        throw new Error("Invalid project id");
    }
    const project = await projectServices.getProjectById(projectId);

    if (!project) {
        res.status(404).json({msg: "Project not found!!"})
    }

    res.status(200).json({
        msg: "Project found!!",
        project: project,
    })
};

const updateProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (isNaN(projectId) || projectId <= 0) {
        res.status(400).json({ msg: "Invalid project id" });
        return;
    }

    try {
        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            res.status(404).json({ msg: "Project not found!" });
            return;
        }
    
        const userId = Number(req.user?.id);
        const userRole = req.user?.role;
    
        // Check if the user is the owner or has Admin role
        if (project.userId !== userId && userRole !== "Admin") {
            res.status(403).json({ msg: "Forbidden: You cannot update this project." });
            return;
        }
    
        const validatedProject = updateProjectSchema.parse({...req.body, id: projectId});
    
        const updatedData = {
            ...validatedProject,
            totalHours: validatedProject.totalHours !== undefined
                    ? validatedProject.totalHours.toString()
                    : undefined,
        }
        const updatedProject = await projectServices.updateProject(projectId, updatedData);
        if (!updatedProject) {
            res.status(404).json({msg:"User not found!!"})
        }
    
        res.status(200).json({
            msg: "Project updated successfully!!",
            project: updatedProject,
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
};

const deleteProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    if (isNaN(projectId) || projectId <= 0) {
        res.status(400).json({ msg: "Invalid project id" });
        return;
    }

    try {
        const userId = Number(req.user?.id);
        const userRole = req.user?.role;
        if (!userId) {
            res.status(401).json({ msg: "Unauthorized, please login first." });
            return;
        }
    
        const project = await projectServices.getProjectById(projectId);
        if (!project) {
            res.status(404).json({ msg: "Project not found!" });
            return;
        }
    
        // Check if the user is the owner or has Admin role
        if (project.userId !== userId && userRole !== "Admin") {
            res.status(403).json({ msg: "Forbidden: You cannot delete this project." });
            return;
        }
    
        const deletedProject = await projectServices.deleteProject(projectId);
    
        res.status(200).json({
            msg: deletedProject.msg,
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getAllProjectsOfAUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.user?.id);
    if (!userId) {
        res.status(401).json({ msg: "Unauthorized, please login first." });
        return;
    }

    try {
        const allProjects = await projectServices.getAllProjectsOfAUser(userId);
        if (!allProjects || allProjects.length === 0) {
            res.status(400).json({msg: "No projects found!!"});
            return;
        }
    
        res.status(200).json({
            msg: "All projects fetched successfully",
            projects: allProjects
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ msg: "Internal Server Error",  error });
    }
}


export {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getAllProjectsOfAUser,
}