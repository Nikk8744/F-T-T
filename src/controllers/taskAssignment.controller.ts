import { Request, Response } from "express";
import { taskAssignmentServices } from "../services/TaskAssignment.service";
import { z } from "zod";
import { notificationService } from "../services/Notification.service";
import { taskServices } from "../services/Task.service";

// Schema for validating taskId and userId parameters
const TaskUserParamsSchema = z.object({
  taskId: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Task ID must be a positive number"
  }),
  userId: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "User ID must be a positive number"
  })
});

// Schema for validating an array of user IDs
const UserIdsSchema = z.object({
  userIds: z.array(z.number().positive())
});

// Task assignment controllers
export const assignUserToTask = async (req: Request, res: Response) => {
  try {
    const { taskId, userId } = TaskUserParamsSchema.parse({
      taskId: req.params.taskId,
      userId: req.params.userId
    });

    const result = await taskAssignmentServices.assignTaskToUser(
      Number(taskId),
      Number(userId)
    );

    // Get task details for notification
    const task = await taskServices.getTaskById(Number(taskId));
    if (task) {
      // Send notification to the assignee
      const initiatorId = Number(req.user?.id);
      await notificationService.notifyTaskAssigned(Number(taskId), task, Number(userId), initiatorId);
    }

    res.status(200).json({
      msg: "User assigned to task successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to assign user to task" });
  }
};

export const unassignUserFromTask = async (req: Request, res: Response) => {
  try {
    const { taskId, userId } = TaskUserParamsSchema.parse({
      taskId: req.params.taskId,
      userId: req.params.userId
    });

    // Get task details before unassigning
    const task = await taskServices.getTaskById(Number(taskId));
    
    await taskAssignmentServices.unassignUserFromTask(
      Number(taskId),
      Number(userId)
    );

    // Optional: Add notification for user being unassigned
    // This is commented out because it might be considered noise for users
    // Uncomment if you want users to be notified when they're unassigned
    /*
    if (task) {
      const initiatorId = Number(req.user?.id);
      await notificationService.createNotification({
        userId: Number(userId),
        type: notificationService.NotificationType.TASK_UPDATED,
        title: 'Removed from Task',
        message: `You have been unassigned from the task "${task.subject}".`,
        entityType: notificationService.EntityType.TASK,
        entityId: Number(taskId),
        initiatorId
      });
    }
    */

    res.status(200).json({
      msg: "User unassigned from task successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to unassign user from task" });
  }
};

export const bulkAssignUsersToTask = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
      res.status(400).json({ msg: "Invalid task ID" });
      return;
    }

    const { userIds } = UserIdsSchema.parse(req.body);
    
    const results = [];
    
    // Get task details for notification
    const task = await taskServices.getTaskById(taskId);
    const initiatorId = Number(req.user?.id);
    
    for (const userId of userIds) {
      const result = await taskAssignmentServices.assignTaskToUser(taskId, userId);
      results.push(result);
      
      // Send notification to each assignee
      if (task) {
        await notificationService.notifyTaskAssigned(taskId, task, userId, initiatorId);
      }
    }

    res.status(200).json({
      msg: "Users assigned to task successfully",
      data: results
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to assign users to task" });
  }
};

export const getTaskAssignees = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    if (isNaN(taskId) || taskId <= 0) {
      res.status(400).json({ msg: "Invalid task ID" });
      return;
    }

    const assignees = await taskAssignmentServices.getTaskAssignees(taskId);

    res.status(200).json({
      msg: "Task assignees retrieved successfully",
      data: assignees
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to get task assignees" });
  }
};

export const getUserAssignedTasks = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const tasks = await taskAssignmentServices.getUserAssignedTasks(userId);

    res.status(200).json({
      msg: "User assigned tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to get user assigned tasks" });
  }
};

// Task follower controllers
// export const addTaskFollower = async (req: Request, res: Response) => {
//   try {
//     const { taskId, userId } = TaskUserParamsSchema.parse({
//       taskId: req.params.taskId,
//       userId: req.params.userId
//     });

//     const result = await taskAssignmentServices.addTaskFollower(
//       Number(taskId),
//       Number(userId)
//     );

//     res.status(200).json({
//       msg: "User added as task follower successfully",
//       data: result
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ errors: error.errors });
//       return;
//     }
//     if (error instanceof Error) {
//       res.status(400).json({ msg: error.message });
//       return;
//     }
//     res.status(500).json({ error: "Failed to add task follower" });
//   }
// };

// export const removeTaskFollower = async (req: Request, res: Response) => {
//   try {
//     const { taskId, userId } = TaskUserParamsSchema.parse({
//       taskId: req.params.taskId,
//       userId: req.params.userId
//     });

//     await taskAssignmentServices.removeTaskFollower(
//       Number(taskId),
//       Number(userId)
//     );

//     res.status(200).json({
//       msg: "User removed as task follower successfully"
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ errors: error.errors });
//       return;
//     }
//     if (error instanceof Error) {
//       res.status(400).json({ msg: error.message });
//       return;
//     }
//     res.status(500).json({ error: "Failed to remove task follower" });
//   }
// };

// export const bulkAddTaskFollowers = async (req: Request, res: Response) => {
//   try {
//     const taskId = Number(req.params.taskId);
//     if (isNaN(taskId) || taskId <= 0) {
//       res.status(400).json({ msg: "Invalid task ID" });
//       return;
//     }

//     const { userIds } = UserIdsSchema.parse(req.body);
    
//     const results = [];
//     for (const userId of userIds) {
//       const result = await taskAssignmentServices.addTaskFollower(taskId, userId);
//       results.push(result);
//     }

//     res.status(200).json({
//       msg: "Users added as task followers successfully",
//       data: results
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ errors: error.errors });
//       return;
//     }
//     if (error instanceof Error) {
//       res.status(400).json({ msg: error.message });
//       return;
//     }
//     res.status(500).json({ error: "Failed to add task followers" });
//   }
// };

// export const getTaskFollowers = async (req: Request, res: Response) => {
//   try {
//     const taskId = Number(req.params.taskId);
//     if (isNaN(taskId) || taskId <= 0) {
//       res.status(400).json({ msg: "Invalid task ID" });
//       return;
//     }

//     const followers = await taskAssignmentServices.getTaskFollowers(taskId);

//     res.status(200).json({
//       msg: "Task followers retrieved successfully",
//       data: followers
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(400).json({ msg: error.message });
//       return;
//     }
//     res.status(500).json({ error: "Failed to get task followers" });
//   }
// };

// export const getUserFollowedTasks = async (req: Request, res: Response) => {
//   try {
//     const userId = Number(req.params.userId);
//     if (isNaN(userId) || userId <= 0) {
//       res.status(400).json({ msg: "Invalid user ID" });
//       return;
//     }

//     const tasks = await taskAssignmentServices.getUserFollowedTasks(userId);

//     res.status(200).json({
//       msg: "User followed tasks retrieved successfully",
//       data: tasks
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(400).json({ msg: error.message });
//       return;
//     }
//     res.status(500).json({ error: "Failed to get user followed tasks" });
//   }
// }; 