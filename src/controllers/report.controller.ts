import { Request, Response } from "express";
import { ReportService } from "../services/Report.service";

export const getProjectSummary = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.user?.id);

        if (isNaN(projectId) || projectId <= 0) {
            res.status(400).json({ msg: 'Invalid project ID' });
            return;
        }

        const reportData = await ReportService.getProjectSummary(projectId, userId);

        res.status(200).json({
            msg: 'Project summary report generated successfully',
            data: reportData
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
        }
        res.status(500).json({ error: 'Failed to generate project summary report' });
    }
}

/* 
export const getProjectTaskBreakdown = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ msg: 'Invalid project ID' });
    }
    
    const reportData = await reportService.getProjectTaskBreakdown(projectId, userId);
    
    return res.status(200).json({
      msg: 'Project task breakdown report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate project task breakdown report' });
  }
};

export const getProjectTeamReport = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ msg: 'Invalid project ID' });
    }
    
    const reportData = await reportService.getProjectTeamAllocation(projectId, userId);
    
    return res.status(200).json({
      msg: 'Project team allocation report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate project team report' });
  }
};

export const getProjectRiskReport = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ msg: 'Invalid project ID' });
    }
    
    const reportData = await reportService.getProjectRiskAssessment(projectId, userId);
    
    return res.status(200).json({
      msg: 'Project risk assessment report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate project risk report' });
  }
};

export const downloadProjectReportPdf = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ msg: 'Invalid project ID' });
    }
    
    // Get report data
    const reportData = await reportService.getProjectSummary(projectId, userId);
    
    // Generate and send PDF
    pdfGenerator.generateProjectReport(reportData, res);
    
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};

// Task Report Controllers
export const getTaskStatusReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    const reportData = await reportService.getTaskStatusDistribution(userId, projectId);
    
    return res.status(200).json({
      msg: 'Task status report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate task status report' });
  }
};

export const getTaskPriorityReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    const reportData = await reportService.getTaskPriorityAnalysis(userId, projectId);
    
    return res.status(200).json({
      msg: 'Task priority report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate task priority report' });
  }
};

export const getOverdueTasksReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    const reportData = await reportService.getOverdueTasks(userId, projectId);
    
    return res.status(200).json({
      msg: 'Overdue tasks report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate overdue tasks report' });
  }
};

export const getTaskCompletionTrendReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const days = req.query.days ? Number(req.query.days) : 30;
    
    const reportData = await reportService.getTaskCompletionTrend(userId, days, projectId);
    
    return res.status(200).json({
      msg: 'Task completion trend report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate task completion trend report' });
  }
};

export const downloadTaskReportPdf = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    // Get report data
    const statusDistribution = await reportService.getTaskStatusDistribution(userId, projectId);
    const priorityAnalysis = await reportService.getTaskPriorityAnalysis(userId, projectId);
    const overdueTasks = await reportService.getOverdueTasks(userId, projectId);
    
    // Combine data for the report
    const reportData = {
      statusDistribution,
      priorityAnalysis,
      overdueTasks
    };
    
    // Generate and send PDF
    const title = projectId ? 'Project Task Report' : 'All Tasks Report';
    pdfGenerator.generateTaskReport(reportData, res, title);
    
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};


*/