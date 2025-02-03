import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { deleteLog, getLogById, getProjectLogs, getTaskLogs, getUserLogs, startTimeLog, stopTimeLog, updateTimeLog } from "../controllers/logs.controller";

const router = Router();


router.use(verifyJWT);

router.route("/startTimeLog").post(startTimeLog);
router.route("/stopTimeLog/:logId").post(stopTimeLog);

router.route("/getLogById/:logId").get(getLogById)
router.route("/getUserLogs/:userId").get(getUserLogs)
router.route("/getProjectLogs/:projectId").get(getProjectLogs)
router.route("/getTaskLogs/:taskId").get(getTaskLogs)

router.route("/deleteLog/:logId").delete(deleteLog)

router.route("/updateLog/:logId").patch(updateTimeLog)

export default router
