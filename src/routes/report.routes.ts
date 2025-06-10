// src/routes/report.routes.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  downloadAllProjectsReportPdf,
  downloadProjectReportPdf,
  downloadTaskReportPdf,
  getAllProjectsSummary,
  getOverdueTasksReport,
  getProjectRiskReport,
  getProjectSummary,
  getProjectTaskBreakdown,
  getProjectTeamReport,
  getProjectTimelineReport,
  getTaskCompletionTrendReport,
  getTaskStatusReport,
  //   getTaskPriorityReport,
} from "../controllers/report.controller";

// Create router
const router = Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// Project report routes
router.route("/project/:projectId/summary").get(getProjectSummary);
router.route("/project/:projectId/team").get(getProjectTeamReport);
router.route("/project/:projectId/risks").get(getProjectRiskReport);
router.route("/project/:projectId/pdf").get(downloadProjectReportPdf); // left
router.route("/project/:projectId/tasks").get(getProjectTaskBreakdown);
router.route("/project/:projectId/timeline").get(getProjectTimelineReport);
router.route("/project/summary/all").get(getAllProjectsSummary);
router.route("/project/summary/all/pdf").get(downloadAllProjectsReportPdf);


// Task report routes
router.route("/tasks/status").get(getTaskStatusReport);
router.route("/tasks/overdue").get(getOverdueTasksReport);
// router.route("/tasks/priority").get(getTaskPriorityReport);
router.route("/tasks/pdf").get(downloadTaskReportPdf);
router.route("/tasks/completion-trend").get(getTaskCompletionTrendReport);

export default router;