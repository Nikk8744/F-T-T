import { Request, Response } from "express";
import { ReportService } from "../services/Report.service";
import { pdfGenerator } from "../utils/pdfGenerator";

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

export const getProjectTeamReport = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      res.status(400).json({ msg: 'Invalid project ID' });
      return;
    }
    
    const reportData = await ReportService.getProjectTeamAllocation(projectId, userId);
    
    res.status(200).json({
      msg: 'Project team allocation report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate project team report' });
    return;
  }
};

export const getProjectRiskReport = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      res.status(400).json({ msg: 'Invalid project ID' });
      return;
    }
    
    const reportData = await ReportService.getProjectRiskAssessment(projectId, userId);
    
    res.status(200).json({
      msg: 'Project risk assessment report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate project risk report' });
    return; 
  }
};

export const getProjectTaskBreakdown = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      res.status(400).json({ msg: 'Invalid project ID' });
      return;
    }
    
    const reportData = await ReportService.getProjectTaskBreakdown(projectId, userId);
    
    res.status(200).json({
      msg: 'Project task breakdown report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate project task breakdown report' });
    return;
  }
};

export const downloadProjectReportPdf = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);
    
    if (isNaN(projectId) || projectId <= 0) {
      res.status(400).json({ msg: 'Invalid project ID' });
      return;
    }
    
    // Get report data
    const reportData = await ReportService.getProjectSummary(projectId, userId);
    
    // Generate and send PDF
    pdfGenerator.generateProjectReport(reportData, res);
    
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate PDF report' });
    return;
  }
};

export const getProjectTimelineReport = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.user?.id);

    if (isNaN(projectId) || projectId <= 0) {
      res.status(400).json({ msg: 'Invalid project ID' });
      return;
    }

    const reportData = await ReportService.getProjectTimeline(projectId, userId); 

    res.status(200).json({
      msg: 'Project timeline report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate project timeline report' });
    return;
  }
}

// Task Report Controllers
export const getTaskStatusReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    const reportData = await ReportService.getTaskStatusDistribution(userId, projectId);
    
    res.status(200).json({
      msg: 'Task status report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate task status report' });
    return;
  }
};


export const getOverdueTasksReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    
    const reportData = await ReportService.getOverdueTasks(userId, projectId);
    
    res.status(200).json({
      msg: 'Overdue tasks report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate overdue tasks report' });
    return;
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
    
    // Get report data
    const statusDistribution = await ReportService.getTaskStatusDistribution(userId, projectId);
    // const priorityAnalysis = await ReportService.getTaskPriorityAnalysis(userId, projectId);
    const overdueTasks = await ReportService.getOverdueTasks(userId, projectId);
    
    // Combine data for the report
    const reportData = {
      statusDistribution,
      // priorityAnalysis,
      overdueTasks
    };
    
    // Generate and send PDF
    const title = projectId ? 'Project Task Report' : 'All Tasks Report';
    pdfGenerator.generateTaskReport(reportData, res, title);
    
  } catch (error) {
    // Only handle errors if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
      return;
    }
  }
};


export const getTaskCompletionTrendReport = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    const days = req.query.days ? Number(req.query.days) : 30;
    
    const reportData = await ReportService.getTaskCompletionTrend(userId, days, projectId);
    
    res.status(200).json({
      msg: 'Task completion trend report generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate task completion trend report' });
    return;
  }
};

export const getAllProjectsSummary = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: 'Invalid user ID' });
      return;
    }
    
    const reportData = await ReportService.getAllProjectsSummary(userId);
    
    res.status(200).json({
      msg: 'All projects summary generated successfully',
      data: reportData
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate all projects summary' });
    return;
  }
};

export const downloadAllProjectsReportPdf = async (req: Request, res: Response) => {
  console.log("downloadAllProjectsReportPdf");
  try {
    const userId = Number(req.user?.id);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ msg: 'Invalid user ID' });
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
    if (error instanceof Error) {
      res.status(400).json({ msg: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};
