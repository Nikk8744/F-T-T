import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createTask, deleteTask, getAllTasks, getProjectTasks, getTask, getUsersTasks, updateTask } from "../controllers/task.controller";

const router = Router();

router.route("/createTask/:projectId").post(verifyJWT, createTask);

router.route("/getTask/:taskId").get(verifyJWT, getTask);

router.route("/getProjectTasks/:projectId").get(verifyJWT, getProjectTasks);

// only for admin
router.route("/getAllTask").get(verifyJWT, getAllTasks);

router.route("/getUserTasks").get(verifyJWT, getUsersTasks);

router.route("/deleteTask/:taskId").delete(verifyJWT, deleteTask)   

router.route("/updateTask/:taskId").patch(verifyJWT, updateTask);


export default router
