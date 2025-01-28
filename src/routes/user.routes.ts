import { Router } from "express";
import { createUser, deleteUser, getUserById, login, logout, updateUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(createUser);

router.route("/getUser/:id").get(verifyJWT, getUserById)

router.route("/updateDetails/:id").patch(verifyJWT, updateUser)

router.route("/deleteUser/:id").delete(deleteUser)

router.route("/login").post(login)

router.route("/logout").post(verifyJWT, logout)

export default router


