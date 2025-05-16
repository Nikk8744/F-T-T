import { Request, Response } from "express";
import { CreateChecklistItemSchema, UpdateChecklistItemSchema } from "../schemas/Task.schema";
import { taskChecklistServices } from "../services/TaskChecklist.service";
import { ZodError } from "zod";

const addChecklistItem = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id)
        const validated = CreateChecklistItemSchema.parse(req.body);
        const item = await taskChecklistServices.addTaskChecklistItem(
          validated.taskId,
          validated.item,
          userId,
        );
        res.status(201).json({
            message: "Checklist item added successfully",
            item
        });
    } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Failed to add checklist item' });
    }
}

const getChecklistItemById = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.params.itemId);
  
    const item = await taskChecklistServices.getChecklistItemById(itemId);
    if(!item){
      res.status(404).json({ message: "Checklist item not found" });
    }
    
    res.status(200).json({
      msg: "Checklist item found",
      item
    })
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
  }
  }
};

const removeChecklistItem = async (req: Request, res: Response) => {
  const itemId = Number(req.params.itemId);

  const removedItem = await taskChecklistServices.removeChecklistItem(itemId);

  res.status(200).json(removedItem.msg)
  return;
};

const updateChecklistItem = async (req: Request, res: Response) => {

  //! NOTEEEE: the update will give error that it failed but the update will be done
  //! it will give error as mysql saves boolean as timyint so ill have to change the logic for that.
  try {
    const itemId = Number(req.params.itemId);
    const userId = Number(req.user?.id);
  
    const validatedData = UpdateChecklistItemSchema.parse(req.body);
    const updatedItem = await taskChecklistServices.updateChecklistItem(itemId, userId, validatedData);
  
    res.status(200).json({
      message: "Checklist item updated successfully",
      item: updatedItem
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to update checklist item' });
  }

};

const getTaskChecklist = async (req: Request, res: Response) => {
  try {
    const checklist = await taskChecklistServices.getTaskChecklist(Number(req.params.taskId));

    res.status(200).json({
      msg: "Task checklist found",
      checklist
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
}

export {
    addChecklistItem,
    getChecklistItemById,
    removeChecklistItem,
    updateChecklistItem,
    getTaskChecklist,
}