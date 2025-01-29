import { Router } from "express";
import { createProject, deleteProject, getAllProjectsOfAUser, getProjectById, updateProject } from "../controllers/project.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/createProject").post(verifyJWT ,createProject);

router.route("/getProject/:id").get(verifyJWT, getProjectById);
router.route("/getAllProjectsOfUser").get(verifyJWT, getAllProjectsOfAUser);


router.route("/updateProject/:id").patch(verifyJWT, updateProject);

router.route("/deleteProject/:id").delete(verifyJWT, deleteProject);

export default router
