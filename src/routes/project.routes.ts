import { Router } from "express";
import { createProject } from "../controllers/project.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/createProject").post(verifyJWT ,createProject);

export default router
