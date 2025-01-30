import { Request, Response } from "express";
import { StartTimeLogSchema, StopTimeLogSchema } from "../schemas/Logs.schema";
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

    // try {
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
    // } catch (error) {
    //     if (error instanceof ZodError) {
    //         res.status(400).json({ errors: error.errors });
    //       }
    //       res.status(500).json({ error: 'Failed to start time log' })
    // }
}

export {
    startTimeLog,
    stopTimeLog,
}