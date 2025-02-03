import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addChecklistItem, getChecklistItemById, getTaskChecklist, removeChecklistItem, updateChecklistItem } from "../controllers/taskChecklist.controller";


const router = Router();

router.use(verifyJWT)

router.route("/addItem").post(addChecklistItem)

router.route("/getChecklistItemById/:itemId").get(getChecklistItemById);
router.route("/getTaskChecklist/:taskId").get(getTaskChecklist);

router.route("/removeChecklistItem/:itemId").delete(removeChecklistItem);

router.route("/updateChecklistItem/:itemId").patch(updateChecklistItem)



export default router
