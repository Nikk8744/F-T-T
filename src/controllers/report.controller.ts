import { Request, Response } from "express";
import { ReportService } from "../services/Report.service";
import { pdfGenerator } from "../utils/pdfGenerator";
import { 
    sendSuccess, 
    sendNotFound, 
    sendError, 
    sendValidationError 
} from "../utils/apiResponse";

export const getProjectSummary = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);

        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }

        const reportData = await ReportService.getProjectSummary(projectId, userId);
        sendSuccess(res, reportData, 'Project summary report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const getProjectTeamReport = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);
        
        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }
        
        const reportData = await ReportService.getProjectTeamAllocation(projectId, userId);
        sendSuccess(res, reportData, 'Project team allocation report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const getProjectRiskReport = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);
        
        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }
        
        const reportData = await ReportService.getProjectRiskAssessment(projectId, userId);
        sendSuccess(res, reportData, 'Project risk assessment report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const getProjectTaskBreakdown = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);
        
        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }
        
        const reportData = await ReportService.getProjectTaskBreakdown(projectId, userId);
        sendSuccess(res, reportData, 'Project task breakdown report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const downloadProjectReportPdf = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);
        
        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }
        
        const reportData = await ReportService.getProjectSummary(projectId, userId);
        pdfGenerator.generateProjectReport(reportData, res);
    } catch (error) {
        if (!res.headersSent) {
            sendError(res, error);
        }
    }
};

export const getProjectTimelineReport = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);

        if (isNaN(projectId) || projectId <= 0) {
            sendValidationError(res, 'Invalid project ID');
            return;
        }

        const reportData = await ReportService.getProjectTimeline(projectId, userId);
        sendSuccess(res, reportData, 'Project timeline report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

// Task Report Controllers
export const getTaskStatusReport = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
        
        const reportData = await ReportService.getTaskStatusDistribution(userId, projectId);
        sendSuccess(res, reportData, 'Task status report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const getOverdueTasksReport = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
        
        const reportData = await ReportService.getOverdueTasks(userId, projectId);
        sendSuccess(res, reportData, 'Overdue tasks report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};



// export const getTaskPriorityReport = async (req: Request, res: Response) => {
//   try {
//     const userId = Number(req.user?.id);
//     const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
//     const reportData = await ReportService.getTaskPriorityAnalysis(userId, projectId);
    
//     return res.status(200).json({
//       msg: 'Task priority report generated successfully',
//       data: reportData
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(400).json({ msg: error.message });
//     }
//     return res.status(500).json({ error: 'Failed to generate task priority report' });
//   }
// };

export const downloadTaskReportPdf = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
        
        const statusDistribution = await ReportService.getTaskStatusDistribution(userId, projectId);
        // const priorityAnalysis = await ReportService.getTaskPriorityAnalysis(userId, projectId);
        const overdueTasks = await ReportService.getOverdueTasks(userId, projectId);
        
        const reportData = {
            statusDistribution,
            // priorityAnalysis,
            overdueTasks
        };
        
        const title = projectId ? 'Project Task Report' : 'All Tasks Report';
        pdfGenerator.generateTaskReport(reportData, res, title);
    } catch (error) {
        if (!res.headersSent) {
            sendError(res, error);
        }
    }
};

export const getTaskCompletionTrendReport = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
        const days = req.query.days ? Number(req.query.days) : 30;
        
        const reportData = await ReportService.getTaskCompletionTrend(userId, days, projectId);
        sendSuccess(res, reportData, 'Task completion trend report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const getAllProjectsSummary = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        if (isNaN(userId) || userId <= 0) {
          sendValidationError(res, 'Invalid user ID');
          return;
        }
        const reportData = await ReportService.getAllProjectsSummary(userId);
        sendSuccess(res, reportData, 'All projects summary report generated successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const downloadAllProjectsReportPdf = async (req: Request, res: Response) => {
  console.log("downloadAllProjectsReportPdf");
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      sendValidationError(res, 'Invalid user ID');
      return;
    }
    
    // Get query parameters for customization
    const includeTaskDetails = req.query.includeTasks === 'true';
    const filterStatus = req.query.status as string | undefined;
    
    // Get report data using existing service
    const reportData = await ReportService.getAllProjectsSummary(userId);
    
    // Apply any filters
    if (filterStatus) {
      reportData.projects = reportData.projects.filter(p => p.status === filterStatus);
    }
    
    // If requested, get detailed task data for each project
    if (includeTaskDetails) {
      for (const project of reportData.projects) {
        // Get tasks for this project that the user has access to
        const tasks = await ReportService.getOverdueTasks(userId, project.id);
        (project as any).tasks = tasks;
      }
    }
    
    // Generate and send PDF
    await pdfGenerator.generateAllProjectsReport(reportData, res);
    
  } catch (error) {
    console.error('Error generating all projects report PDF:', error);
    // if (error instanceof Error) {
    //   res.status(400).json({ msg: error.message });
    //   return;
    // }
    // res.status(500).json({ error: 'Failed to generate PDF report' });
    sendError(res, error);
  }
};
