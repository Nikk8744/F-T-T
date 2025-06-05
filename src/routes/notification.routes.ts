import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  // getNotificationPreferences,
  // updateNotificationPreference,
  // initializeNotificationPreferences,
  getUnreadNotificationsCount,
  manualCheckDeadlines
} from "../controllers/notification.controller";

// Create router
const router = Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// Notification routes
router.route("/").get(getUserNotifications);
router.route("/unread-count").get(getUnreadNotificationsCount);
router.route("/mark-read/:notificationId").patch(markNotificationAsRead);
router.route("/mark-all-read").patch(markAllNotificationsAsRead);
router.route("/check-deadlines").post(manualCheckDeadlines);
router.route("/:notificationId").delete(deleteNotification);

// Notification preferences routes - commented out since we're not using preferences for now
// router.route("/preferences").get(getNotificationPreferences);
// router.route("/preferences").patch(updateNotificationPreference);
// router.route("/preferences/initialize").post(initializeNotificationPreferences);

export default router; 