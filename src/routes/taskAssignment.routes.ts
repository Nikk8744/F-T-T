import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    assignUserToTask,
    unassignUserFromTask,
    bulkAssignUsersToTask,
    getTaskAssignees,
    getUserAssignedTasks,
    addTaskFollower,
    removeTaskFollower,
    bulkAddTaskFollowers,
    getTaskFollowers,
    getUserFollowedTasks
} from "../controllers/taskAssignment.controller";

const router = Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// Task assignment routes
router.route("/assign/:taskId/:userId").post(assignUserToTask);
router.route("/unassign/:taskId/:userId").delete(unassignUserFromTask);
router.route("/bulk-assign/:taskId").post(bulkAssignUsersToTask);
router.route("/task/:taskId/assignees").get(getTaskAssignees);
router.route("/user/:userId/assigned").get(getUserAssignedTasks);

// Task follower routes
router.route("/follow/:taskId/:userId").post(addTaskFollower);
router.route("/unfollow/:taskId/:userId").delete(removeTaskFollower);
router.route("/bulk-follow/:taskId").post(bulkAddTaskFollowers);
router.route("/task/:taskId/followers").get(getTaskFollowers);
router.route("/user/:userId/following").get(getUserFollowedTasks);

export default router; 