import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createTask, getTask } from "../controllers/task.controller";

const router = Router();

router.route("/createTask/:projectId").post(verifyJWT, createTask);

router.route("/getTask/:taskId").get(verifyJWT, getTask);


export default router
