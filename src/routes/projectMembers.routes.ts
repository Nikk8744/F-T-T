import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addMemberToProject, getAllMembersOfAProject, getAllProjectsAUserIsMemberOf, removeMember } from "../controllers/projectMember.controller";
import { isProjectOwner } from "../middlewares/isOwner.middleware";

const router = Router();

router.use(verifyJWT)

router.route("/addMember").post(isProjectOwner, addMemberToProject);

router.route("/removeMember").delete(isProjectOwner, removeMember);

router.route("/getAllMembers/:projectId").get(isProjectOwner, getAllMembersOfAProject);

router.route("/getAllProjectsAUserIsMemberOf").get(getAllProjectsAUserIsMemberOf);

export default router
