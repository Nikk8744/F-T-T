// src/routes/report.routes.ts
import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { 
    getProjectSummary, 
    getProjectTeamReport, 
    getProjectRiskReport, 
    getProjectTaskBreakdown,
    downloadProjectReportPdf,
    getProjectTimelineReport,
    getTaskStatusReport,
    getOverdueTasksReport,
    getTaskPriorityReport,
    downloadTaskReportPdf,
    getTaskCompletionTrendReport,
    getAllProjectsSummary,
    downloadAllProjectsReportPdf
} from '../controllers/report.controller';

const router = express.Router();

// All report routes require authentication
router.use(verifyJWT);

// Project report routes
router.get('/project/:projectId/summary', getProjectSummary);
router.get('/project/:projectId/team', getProjectTeamReport);
router.get('/project/:projectId/risks', getProjectRiskReport);
router.get('/project/:projectId/tasks', getProjectTaskBreakdown);
router.get('/project/:projectId/timeline', getProjectTimelineReport);
router.get('/project/:projectId/pdf', downloadProjectReportPdf);

// Task report routes
router.get('/tasks/status', getTaskStatusReport);
router.get('/tasks/overdue', getOverdueTasksReport);
router.get('/tasks/priority', getTaskPriorityReport);
router.get('/tasks/completion-trend', getTaskCompletionTrendReport);
router.get('/tasks/pdf', downloadTaskReportPdf);

// Dashboard summary routes
router.get('/project/summary/all', getAllProjectsSummary);
router.get('/project/summary/all/pdf', downloadAllProjectsReportPdf);

export default router;