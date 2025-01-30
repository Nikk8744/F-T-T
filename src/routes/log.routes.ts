import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { startTimeLog, stopTimeLog } from "../controllers/logs.controller";

const router = Router();


router.use(verifyJWT);

router.route("/startTimeLog").post(startTimeLog);
router.route("/stopTimeLog/:logId").post(stopTimeLog);


export default router
