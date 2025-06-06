import { Request, Response } from "express";
import { notificationService, NotificationType } from "../services/Notification.service";
import { z } from "zod";
import { checkAllDeadlines } from "../crons/deadlineNotifications";

// Schema for validating notification preference updates
const NotificationPreferenceSchema = z.object({
  type: z.string(),
  enabled: z.boolean()
});

// Schema for validating notification ID
const NotificationIdSchema = z.object({
  notificationId: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Notification ID must be a positive number"
  })
});

// Get user's notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    // Parse pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);
    const unreadCount = await notificationService.getUnreadNotificationsCount(userId);

    res.status(200).json({
      msg: "Notifications retrieved successfully",
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          offset
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to retrieve notifications" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const { notificationId } = NotificationIdSchema.parse({
      notificationId: req.params.notificationId
    });

    await notificationService.markNotificationAsRead(Number(notificationId), userId);

    res.status(200).json({
      msg: "Notification marked as read"
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
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    await notificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      msg: "All notifications marked as read"
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const { notificationId } = NotificationIdSchema.parse({
      notificationId: req.params.notificationId
    });

    await notificationService.deleteNotification(Number(notificationId), userId);

    res.status(200).json({
      msg: "Notification deleted successfully"
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
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Get user's notification preferences
/* 
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const preferences = await notificationService.getUserNotificationPreferences(userId);

    res.status(200).json({
      msg: "Notification preferences retrieved successfully",
      data: preferences
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to retrieve notification preferences" });
  }
};
*/

// Update notification preference
/*
export const updateNotificationPreference = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const { type, enabled } = NotificationPreferenceSchema.parse(req.body);

    // Validate that the type is a valid NotificationType
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      res.status(400).json({ msg: "Invalid notification type" });
      return;
    }

    await notificationService.updateNotificationPreference(userId, type as NotificationType, enabled);

    res.status(200).json({
      msg: "Notification preference updated successfully"
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
    res.status(500).json({ error: "Failed to update notification preference" });
  }
};
*/

// Initialize user's notification preferences
/*
export const initializeNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    await notificationService.initializeUserNotificationPreferences(userId);

    res.status(200).json({
      msg: "Notification preferences initialized successfully"
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to initialize notification preferences" });
  }
};
*/

// Get unread notifications count
export const getUnreadNotificationsCount = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const count = await notificationService.getUnreadNotificationsCount(userId);

    res.status(200).json({
      msg: "Unread notifications count retrieved successfully",
      data: { count }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to get unread notifications count" });
  }
}; 

// Manually trigger deadline checks (admin only)
export const manualCheckDeadlines = async (req: Request, res: Response) => {
  try {
    // Only allow admins to trigger this manually
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: "Unauthorized: Admin access required" });
      return;
    }
    
    console.log("Manual deadline check triggered by admin");
    await checkAllDeadlines();
    
    res.status(200).json({ message: "Deadline check completed successfully" });
  } catch (error) {
    console.error("Error during manual deadline check:", error);
    res.status(500).json({ message: "Failed to run deadline check" });
  }
}; 