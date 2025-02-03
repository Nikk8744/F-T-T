import { Request, Response } from "express";
import { StartTimeLogSchema, StopTimeLogSchema, UpdateTimeLogSchema } from "../schemas/Logs.schema";
import { logServices } from "../services/Logs.service";
import { ZodError } from "zod";

const startTimeLog = async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
        res.status(400).json({ msg: "Invalid project id" });
        return;
    }

    try {
        const validatedData = StartTimeLogSchema.parse(req.body);
    
        const startTimeLog = await logServices.startTimeLog(userId);
        if(!startTimeLog){
            res.status(400).json({ msg: "Error starting log" });
        }
    
        res.status(200).json({
            msg: "Log started successfully",
            data: startTimeLog
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
          }
          res.status(500).json({ error: 'Failed to start time log' })
    }
};

const stopTimeLog = async (req: Request, res: Response) => {

    try {
        const userId = Number(req.user?.id)
        const logId = Number(req.params.logId)
        if (isNaN(userId) || userId <= 0 || isNaN(logId) || logId <= 0 ) {
            res.status(400).json({ msg: "Invalid id`s" });
        }
        const validatedData = StopTimeLogSchema.parse(req.body);
        const log = await logServices.stopTimeLog(userId, logId, validatedData);
        if (!log) {
            res.status(400).json({ msg: "Error stopping log" });
        }
    
        res.status(200).json({
            msg: "Log stopped successfully",
            data: log
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
          }
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
          res.status(500).json({ error: 'Failed to stop time log' })
    }
};

const getLogById = async (req: Request, res: Response) => {
    try {
        const logId = Number(req.params.logId);
        if (isNaN(logId) || logId <= 0) {
            res.status(400).json({ msg: "Invalid id" });
        }
    
        const log = await logServices.getLogById(logId);
        if (!log) {
            res.status(404).json({ msg: "Log not found" });
        }
    
        res.status(200).json({
            msg: "Log found successfully",
            data: log
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch the log' })
    }
};

const getUserLogs = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ msg: "Invalid id" });
        }
    
        const userLogs = await logServices.getUserLogs(userId);
        if (!userLogs) {
            res.status(404).json({ msg: "User logs not found" });
        }
    
        res.status(200).json({
            msg: "User logs found successfully",
            data: userLogs
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to get user logs' })
    }
};

const getProjectLogs = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        if (isNaN(projectId) || projectId <= 0) {
            res.status(400).json({ msg: "Invalid id" });
        }
    
        const projectLogs = await logServices.getProjectLogs(projectId);
        if (!projectLogs) {
            res.status(404).json({ msg: "User logs not found" });
        }
    
        res.status(200).json({
            msg: "Project's logs fetched successfully",
            data: projectLogs
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to get Project Logs' })
    }
};

const getTaskLogs = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.taskId);
        if (isNaN(taskId) || taskId <= 0) {
            res.status(400).json({ msg: "Invalid id" });
        }

        const taskLogs = await logServices.getTaskLogs(taskId);
        if (!taskLogs) {
            res.status(404).json({ msg: "User logs not found" });
        }

        res.status(200).json({
            msg: "Task's logs fetched successfully",
            data: taskLogs
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to get Task Logs' })
    }
};

const deleteLog = async (req: Request, res: Response) => {
    try {
        const logId = Number(req.params.logId);
        if (isNaN(logId) || logId <= 0) {
            res.status(400).json({ msg: "Invalid id" });
        }

        const deletedLog = await logServices.deleteLog(logId);
        if (!deletedLog) {
            res.status(404).json({ msg: "Cannot delete log" });
        }

        res.status(200).json({
            msg: "Log has been deleted successfully",
            data: deleteLog
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to delete Log' })
    }
};

const updateTimeLog = async (req: Request, res: Response) => {

    const userId = Number(req.user?.id);
    const logId = Number(req.params.logId);

    try {
        const validatedData = UpdateTimeLogSchema.parse(req.body);
        const updates = {
            ...validatedData,
            startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
            endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined
          };
        const updatedLog = await logServices.updateLog(logId, userId, updates);
    
        res.status(200).json({
            msg: "Log has been updated successfully",
            data: updatedLog
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors });
          }
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
          res.status(500).json({ error: 'Failed to update time log' })
    }
}

export {
    startTimeLog,
    stopTimeLog,
    getLogById,
    getUserLogs,
    getProjectLogs,
    getTaskLogs,
    deleteLog,
    updateTimeLog,
}