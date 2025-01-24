import { Router } from "express";
import { createUser } from "../controllers/user.controller";

const router = Router();

router.route("/createUser").post(createUser);

export default router


