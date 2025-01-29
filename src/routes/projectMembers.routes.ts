import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addMemberToProject } from "../controllers/projectMember.controller";

const router = Router();

router.route("/addMember").post(verifyJWT, addMemberToProject);

export default router
