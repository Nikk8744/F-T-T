import { Router } from "express";
import { createUser, deleteUser, getUserById, updateUser } from "../controllers/user.controller";

const router = Router();

router.route("/register").post(createUser);

router.route("/getUser/:id").get(getUserById)

router.route("/updateDetails/:id").patch(updateUser)

router.route("/deleteUser/:id").delete(deleteUser)

export default router


