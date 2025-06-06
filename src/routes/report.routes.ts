// src/routes/report.routes.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getProjectSummary,
//   getProjectTaskBreakdown,
//   getProjectTeamReport,
//   getProjectRiskReport,
//   downloadProjectReportPdf,
//   getTaskStatusReport,
//   getTaskPriorityReport,
//   getOverdueTasksReport,
//   getTaskCompletionTrendReport,
//   downloadTaskReportPdf
} from "../controllers/report.controller";

// Create router
const router = Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// Project report routes
router.route("/project/:projectId/summary").get(getProjectSummary); 
// router.route("/project/:projectId/tasks").get(getProjectTaskBreakdown);
// router.route("/project/:projectId/team").get(getProjectTeamReport);
// router.route("/project/:projectId/risks").get(getProjectRiskReport);
// router.route("/project/:projectId/pdf").get(downloadProjectReportPdf);

// // Task report routes
// router.route("/tasks/status").get(getTaskStatusReport);
// router.route("/tasks/priority").get(getTaskPriorityReport);
// router.route("/tasks/overdue").get(getOverdueTasksReport);
// router.route("/tasks/completion-trend").get(getTaskCompletionTrendReport);
// router.route("/tasks/pdf").get(downloadTaskReportPdf);

export default router;