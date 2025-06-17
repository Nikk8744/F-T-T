import { Request, Response } from "express";
import { CreateChecklistItemSchema, UpdateChecklistItemSchema } from "../schemas/Task.schema";
import { taskChecklistServices } from "../services/TaskChecklist.service";
import { ZodError } from "zod";
import { 
    sendSuccess, 
    sendNotFound, 
    sendError, 
    sendValidationError 
} from "../utils/apiResponse";

const addChecklistItem = async (req: Request, res: Response) => {
    try {
        const validated = CreateChecklistItemSchema.parse(req.body);
        const userId = Number(req.user?.id);

        if (isNaN(validated.taskId) || validated.taskId <= 0) {
            sendValidationError(res, 'Invalid task ID');
            return;
        }

        if (!validated.item) {
            sendValidationError(res, 'Item text is required');
            return;
        }

        const checklistItem = await taskChecklistServices.addTaskChecklistItem(validated.taskId, validated.item, userId);
        sendSuccess(res, checklistItem, 'Checklist item created successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const getChecklistItemById = async (req: Request, res: Response) => {
    try {
        const itemId = Number(req.params.itemId);
        const item = await taskChecklistServices.getChecklistItemById(itemId);
        if(!item){
          sendNotFound(res, 'Checklist item not found');
          return;
        }
        sendSuccess(res, item, 'Checklist item retrieved successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const removeChecklistItem = async (req: Request, res: Response) => {
    try {
        const itemId = Number(req.params.itemId);

        if (isNaN(itemId) || itemId <= 0) {
            sendValidationError(res, 'Invalid checklist item ID');
            return;
        }

        const removedItem = await taskChecklistServices.removeChecklistItem(itemId);
        sendSuccess(res, removedItem.msg, 'Checklist item deleted successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const updateChecklistItem = async (req: Request, res: Response) => {
    try {
        const itemId = Number(req.params.itemId);
        const userId = Number(req.user?.id);
        const validatedData = UpdateChecklistItemSchema.parse(req.body);


        if (isNaN(itemId) || itemId <= 0) {
            sendValidationError(res, 'Invalid checklist item ID');
            return;
        }

        const updatedItem = await taskChecklistServices.updateChecklistItem(itemId, userId, validatedData);
        if (!updatedItem) {
            sendNotFound(res, 'Checklist item not found');
            return;
        }
        sendSuccess(res, updatedItem, 'Checklist item updated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

const getTaskChecklist = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.taskId);

        if (isNaN(taskId) || taskId <= 0) {
            sendValidationError(res, 'Invalid task ID');
            return;
        }

        const checklist = await taskChecklistServices.getTaskChecklist(taskId);
        sendSuccess(res, checklist, 'Task checklist retrieved successfully');
    } catch (error) {
        sendError(res, error);
    }
};


export {
  addChecklistItem,
  getChecklistItemById,
  removeChecklistItem,
  updateChecklistItem,
  getTaskChecklist,
}