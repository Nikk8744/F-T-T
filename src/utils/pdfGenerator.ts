// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';

export class PDFGenerator {
  private doc: PDFKit.PDFDocument;

  constructor() {
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });
  }

  // Simple table helper method
  private createSimpleTable(headers: string[], rows: string[][]) {
    const startX = 50;
    const startY = this.doc.y;
    const columnWidth = (this.doc.page.width - 100) / headers.length;
    const rowHeight = 25;

    // Draw headers
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold');

    headers.forEach((header, i) => {
      this.doc.text(header, startX + (i * columnWidth), startY, {
        width: columnWidth - 5,
        align: 'left'
      });
    });

    // Draw a line under headers
    this.doc
      .moveTo(startX, startY + 20)
      .lineTo(this.doc.page.width - 50, startY + 20)
      .stroke();

    // Draw rows
    this.doc
      .fontSize(10)
      .font('Helvetica');

    rows.forEach((row, rowIndex) => {
      const rowY = startY + 30 + (rowIndex * rowHeight);

      row.forEach((cell, cellIndex) => {
        this.doc.text(cell, startX + (cellIndex * columnWidth), rowY, {
          width: columnWidth - 5,
          align: cellIndex === 0 ? 'left' : 'center'
        });
      });
    });

    // Move doc position after table
    this.doc.y = startY + 30 + (rows.length * rowHeight) + 10;
  }

  generateProjectReport(data: any, res: Response) {
    const { project, taskStats, completionPercentage, membersCount, totalTasks } = data;

    // Create a new PDF document
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=project-report-${project.id}.pdf`);

    // Pipe the PDF to the response
    this.doc.pipe(res);

    // Page layout constants
    const leftMargin = 50;
    const pageWidth = this.doc.page.width;
    const contentWidth = pageWidth - 100;
    const rightColumnX = pageWidth / 2 + 25;

    // Add header
    this.addHeader(`Project Report: ${project.name}`);
    this.doc.moveDown(1);

    // Project summary section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Project Summary', leftMargin, this.doc.y, { align: 'center', width: contentWidth })
      .moveDown(1);

    this.doc
      .fontSize(12)
      .font('Helvetica');

    // Row 1: Status and Completion
    let currentY = this.doc.y;
    this.doc
      .text(`Status: ${project.status || 'Not Set'}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Completion: ${completionPercentage || 0}%`, rightColumnX, currentY, { width: 250 });

    currentY += 20;
    this.doc.y = currentY;

    // Row 2: Timeline
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set';
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';

    this.doc
      .text(`Start Date: ${startDate}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`End Date: ${endDate}`, rightColumnX, currentY, { width: 250 });

    currentY += 20;
    this.doc.y = currentY;

    // Row 3: Team and Tasks
    this.doc
      .text(`Team Members: ${membersCount || 0}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Total Tasks: ${totalTasks || 0}`, rightColumnX, currentY, { width: 250 });

    currentY += 20;
    this.doc.y = currentY;

    // Row 4: Owner and Priority (if available)
    if (project.owner || project.priority) {
      this.doc
        .text(`Owner: ${project.owner || 'Not assigned'}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`Priority: ${project.priority || 'Normal'}`, rightColumnX, currentY, { width: 250 });
      
      currentY += 20;
      this.doc.y = currentY;
    }

    this.doc.moveDown(1);

    // Project Description
    if (project.description) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Project Description', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text(project.description, leftMargin, this.doc.y, { width: contentWidth })
        .moveDown(1.5);
    }

    // Progress Overview Section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Progress Overview', leftMargin, this.doc.y)
      .moveDown(0.5);

    // Progress metrics in two columns
    this.doc
      .fontSize(12)
      .font('Helvetica');

    currentY = this.doc.y;

    // Calculate metrics
    const completedTasks = taskStats.find((stat: any) => stat.status === 'Completed')?.count || 0;
    const inProgressTasks = taskStats.find((stat: any) => stat.status === 'In Progress')?.count || 0;
    const pendingTasks = taskStats.find((stat: any) => stat.status === 'Pending' || stat.status === 'Todo')?.count || 0;
    const overdueTasks = data.overdueTasks?.length || 0;

    // Progress metrics
    this.doc
      .text(`Completed Tasks: ${completedTasks}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`In Progress: ${inProgressTasks}`, rightColumnX, currentY, { width: 250 });

    currentY += 20;
    this.doc.y = currentY;

    this.doc
      .text(`Pending Tasks: ${pendingTasks}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Overdue Tasks: ${overdueTasks}`, rightColumnX, currentY, { width: 250 });

    currentY += 30;
    this.doc.y = currentY;

    // Task Status Distribution section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Task Status Distribution', leftMargin, this.doc.y)
      .moveDown(0.5);

    // Add summary line
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Breakdown of all ${totalTasks} tasks by current status:`, leftMargin, this.doc.y)
      .moveDown(0.5);

    if (taskStats && taskStats.length > 0) {
      this.createSimpleTable(
        ['Status', 'Count', 'Percentage'],
        taskStats.map((stat: { status: string; count: number }) => [
          stat.status || 'Unset',
          String(stat.count),
          totalTasks > 0 ? `${Math.round((Number(stat.count) / totalTasks) * 100)}%` : '0%'
        ])
      );
    } else {
      this.doc
        .fontSize(12)
        .font('Helvetica-Oblique')
        .text('No task data available for this project.', leftMargin, this.doc.y)
        .moveDown(0.5);
    }

    this.doc.moveDown(1.5);

    // Timeline Analysis (if dates are available)
    if (project.startDate || project.endDate) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Timeline Analysis', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica');

      currentY = this.doc.y;

      // Calculate duration and time elapsed
      if (project.startDate && project.endDate) {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const today = new Date();
        
        const totalDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        this.doc
          .text(`Total Duration: ${totalDuration} days`, leftMargin, currentY, { width: 250 });
        this.doc
          .text(`Days Elapsed: ${Math.max(0, elapsedDays)}`, rightColumnX, currentY, { width: 250 });

        currentY += 20;
        this.doc.y = currentY;

        const timeProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDuration) * 100)));
        
        this.doc
          .text(`Time Progress: ${timeProgress}%`, leftMargin, currentY, { width: 250 });
        this.doc
          .text(`Remaining Days: ${Math.max(0, remainingDays)}`, rightColumnX, currentY, { width: 250 });

        currentY += 30;
        this.doc.y = currentY;
      }
    }

    // Recent Activity or Notes (if available)
    if (data.recentTasks && data.recentTasks.length > 0) {
      // Check if we need a new page
      if (this.doc.y > this.doc.page.height - 200) {
        this.doc.addPage();
      }

      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Recent Task Activity', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text('Recently completed or updated tasks:', leftMargin, this.doc.y)
        .moveDown(0.5);

      const recentToShow = data.recentTasks.slice(0, 5);

      this.createSimpleTable(
        ['Task', 'Status', 'Updated', 'Assignee'],
        recentToShow.map((task: any) => [
          task.subject && task.subject.length > 35 ? task.subject.substring(0, 32) + '...' : (task.subject || 'Untitled Task'),
          task.status || 'Unknown',
          task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A',
          task.assignee || 'Unassigned'
        ])
      );

      this.doc.moveDown(1.5);
    }

    // Project Health Indicator
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Project Health Status', leftMargin, this.doc.y)
      .moveDown(0.5);

    // Determine health status based on completion and overdue tasks
    let healthStatus = 'Good';
    let healthColor = 'On track with no major issues';
    
    if (overdueTasks > 0 || (completionPercentage || 0) < 50) {
      healthStatus = 'Needs Attention';
      healthColor = 'Some tasks are overdue or progress is behind schedule';
    }
    
    if (overdueTasks > 5 || (completionPercentage || 0) < 25) {
      healthStatus = 'Critical';
      healthColor = 'Multiple overdue tasks or significantly behind schedule';
    }

    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Status: ${healthStatus}`, leftMargin, this.doc.y)
      .moveDown(0.3)
      .font('Helvetica')
      .text(healthColor, leftMargin, this.doc.y)
      .moveDown(1.5);

    // Move to bottom of page for footer
    this.doc.y = this.doc.page.height - 80;

    // Enhanced footer with proper alignment
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, leftMargin, this.doc.y, { 
        align: 'center',
        width: contentWidth
      })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, leftMargin, this.doc.y, { 
        align: 'center',
        width: contentWidth
      });

    // Finalize the PDF
    this.doc.end();
}

  generateTaskReport(data: any, res: Response, title: string = 'Task Report') {
    // Create a new PDF document
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=task-report-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    this.doc.pipe(res);

    // Page layout constants
    const leftMargin = 50;
    const pageWidth = this.doc.page.width;
    const contentWidth = pageWidth - 100; // Account for both margins

    // Add header
    this.addHeader(title);
    this.doc.moveDown(1);

    // Add report overview section if we have summary data
    if (data.summary) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Report Overview', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica');

      const rightColumnX = pageWidth / 2 + 25;
      let currentY = this.doc.y;

      if (data.summary.totalTasks !== undefined) {
        this.doc.text(`Total Tasks: ${data.summary.totalTasks}`, leftMargin, currentY, { width: 250 });
        if (data.summary.completedTasks !== undefined) {
          this.doc.text(`Completed Tasks: ${data.summary.completedTasks}`, rightColumnX, currentY, { width: 250 });
        }
        currentY += 20;
        this.doc.y = currentY;
      }

      if (data.summary.overdueTasks !== undefined) {
        this.doc.text(`Overdue Tasks: ${data.summary.overdueTasks}`, leftMargin, currentY, { width: 250 });
        if (data.summary.upcomingTasks !== undefined) {
          this.doc.text(`Upcoming Tasks: ${data.summary.upcomingTasks}`, rightColumnX, currentY, { width: 250 });
        }
        currentY += 20;
        this.doc.y = currentY;
      }

      this.doc.moveDown(1.5);
    }

    // Status Distribution
    if (data.statusDistribution && data.statusDistribution.distribution) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Task Status Distribution', leftMargin, this.doc.y)
        .moveDown(0.5);

      // Add summary line if total is available
      if (data.statusDistribution.total) {
        this.doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Total Tasks Analyzed: ${data.statusDistribution.total}`, leftMargin, this.doc.y)
          .moveDown(0.5);
      }

      this.createSimpleTable(
        ['Status', 'Count', 'Percentage'],
        data.statusDistribution.distribution.map((stat: any) => {
          const percentage = data.statusDistribution.total 
            ? Math.round((stat.count / data.statusDistribution.total) * 100)
            : 0;
          return [
            stat.status || 'Unset',
            String(stat.count),
            `${percentage}%`
          ];
        })
      );

      this.doc.moveDown(1.5);
    }

    // Priority Analysis
    if (data.priorityAnalysis && data.priorityAnalysis.length > 0) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Priority Analysis', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text('Task completion rates by priority level:', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.createSimpleTable(
        ['Priority', 'Total', 'Completed', 'Completion Rate'],
        data.priorityAnalysis.map((item: any) => [
          item.priority || 'Unset',
          String(item.total),
          String(item.completed),
          `${item.completionRate}%`
        ])
      );

      this.doc.moveDown(1.5);
    }

    // Overdue Tasks
    if (data.overdueTasks && data.overdueTasks.length > 0) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Overdue Tasks', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text(`${data.overdueTasks.length} task(s) are currently overdue:`, leftMargin, this.doc.y)
        .moveDown(0.5);

      // Limit to first 15 overdue tasks to prevent overly long reports
      const tasksToShow = data.overdueTasks.slice(0, 15);

      this.createSimpleTable(
        ['Task', 'Project', 'Due Date', 'Days Overdue'],
        tasksToShow.map((task: any) => [
          task.subject && task.subject.length > 35 ? task.subject.substring(0, 32) + '...' : (task.subject || 'Untitled Task'),
          task.projectName && task.projectName.length > 25 ? task.projectName.substring(0, 22) + '...' : (task.projectName || 'N/A'),
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
          task.daysOverdue ? `${task.daysOverdue} days` : 'N/A'
        ])
      );

      // Add note if there are more overdue tasks
      if (data.overdueTasks.length > 15) {
        this.doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text(`... and ${data.overdueTasks.length - 15} more overdue tasks`, leftMargin, this.doc.y)
          .moveDown(0.5);
      }

      this.doc.moveDown(1.5);
    }

    // Upcoming Tasks (if available)
    if (data.upcomingTasks && data.upcomingTasks.length > 0) {
      // Check if we need a new page
      if (this.doc.y > this.doc.page.height - 200) {
        this.doc.addPage();
      }

      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Upcoming Tasks (Next 7 Days)', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text(`${data.upcomingTasks.length} task(s) due in the next 7 days:`, leftMargin, this.doc.y)
        .moveDown(0.5);

      const upcomingToShow = data.upcomingTasks.slice(0, 10);

      this.createSimpleTable(
        ['Task', 'Project', 'Due Date', 'Priority'],
        upcomingToShow.map((task: any) => [
          task.subject && task.subject.length > 35 ? task.subject.substring(0, 32) + '...' : (task.subject || 'Untitled Task'),
          task.projectName && task.projectName.length > 25 ? task.projectName.substring(0, 22) + '...' : (task.projectName || 'N/A'),
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
          task.priority || 'Normal'
        ])
      );

      if (data.upcomingTasks.length > 10) {
        this.doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text(`... and ${data.upcomingTasks.length - 10} more upcoming tasks`, leftMargin, this.doc.y)
          .moveDown(0.5);
      }

      this.doc.moveDown(1.5);
    }

    // Task Timeline Summary (if date range data is available)
    if (data.dateRange) {
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Report Period', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text(`From: ${new Date(data.dateRange.from).toLocaleDateString()}`, leftMargin, this.doc.y)
        .text(`To: ${new Date(data.dateRange.to).toLocaleDateString()}`, leftMargin, this.doc.y)
        .moveDown(1);
    }

    // Move to bottom of page for footer
    this.doc.y = this.doc.page.height - 80;

    // Enhanced footer with proper alignment
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, leftMargin, this.doc.y, { 
        align: 'center',
        width: contentWidth
      })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, leftMargin, this.doc.y, { 
        align: 'center',
        width: contentWidth
      });

    // Finalize the PDF
    this.doc.end();
}

  generateAllProjectsReport(data: any, res: Response) {
    const { summary, projects } = data;

    // Create a new PDF document
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=all-projects-report-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    this.doc.pipe(res);

    // Add header
    this.addHeader('All Projects Report');
    this.doc.moveDown(1);

    // Add summary section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Portfolio Summary', { align: 'center' })
      .moveDown(1);

    // Summary stats with proper alignment
    this.doc
      .fontSize(12)
      .font('Helvetica');

    const leftMargin = 50;
    const pageWidth = this.doc.page.width;
    const rightColumnX = pageWidth / 2 + 25; // Position for right column

    // Row 1 - Reset position and use absolute positioning
    let currentY = this.doc.y;
    this.doc
      .text(`Total Projects: ${summary.totalProjects}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Completed Projects: ${summary.completedProjects} (${summary.projectCompletionRate}%)`, rightColumnX, currentY, { width: 250 });
    
    // Move to next row
    currentY += 20;
    this.doc.y = currentY;

    // Row 2
    this.doc
      .text(`Total Tasks: ${summary.totalTasks}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Completed Tasks: ${summary.completedTasks} (${summary.taskCompletionRate}%)`, rightColumnX, currentY, { width: 250 });
    
    // Move to next row
    currentY += 20;
    this.doc.y = currentY;

    // Row 3
    this.doc
      .text(`Overdue Tasks: ${summary.overdueTasks}`, leftMargin, currentY, { width: 250 });
    this.doc
      .text(`Approaching Deadlines: ${summary.approachingDeadlines}`, rightColumnX, currentY, { width: 250 });
    
    // Move down for next section
    this.doc.y = currentY + 30;

    // Projects overview section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Projects Overview', leftMargin, this.doc.y)
      .moveDown(0.5);

    // Simple projects table
    this.createSimpleTable(
      ['Project Name', 'Status', 'Progress', 'Tasks', 'Overdue'],
      projects.map((project: any) => [
        project.name.length > 30 ? project.name.substring(0, 27) + '...' : project.name,
        project.status,
        `${project.completionPercentage}%`,
        `${project.completedTasks}/${project.totalTasks}`,
        project.overdueTasks.toString()
      ])
    );

    this.doc.moveDown(1);

    // Add individual project details
    projects.forEach((project: any, index: number) => {
      // Add page break for each new project (except first)
      if (index > 0) {
        this.doc.addPage();
      }

      // Project header - ensure it starts at left margin
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`Project: ${project.name}`, leftMargin, this.doc.y)
        .moveDown(0.5);

      // Project details with proper alignment
      this.doc
        .fontSize(12)
        .font('Helvetica');

      // Row 1: Status and Completion
      currentY = this.doc.y;
      this.doc
        .text(`Status: ${project.status}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`Completion: ${project.completionPercentage}%`, rightColumnX, currentY, { width: 250 });
      
      currentY += 20;
      this.doc.y = currentY;

      // Row 2: Team and Role
      this.doc
        .text(`Team Members: ${project.teamMembers}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`Your Role: ${project.isOwner ? 'Owner' : 'Member'}`, rightColumnX, currentY, { width: 250 });
      
      currentY += 20;
      this.doc.y = currentY;

      // Row 3: Timeline
      const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set';
      const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';

      this.doc
        .text(`Start Date: ${startDate}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`End Date: ${endDate}`, rightColumnX, currentY, { width: 250 });
      
      currentY += 20;
      this.doc.y = currentY;

      // Description - full width
      if (project.description) {
        this.doc
          .text(`Description: ${project.description}`, leftMargin, this.doc.y, { width: pageWidth - 100 })
          .moveDown(0.5);
      }

      this.doc.moveDown(1);

      // Task summary
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Task Summary', leftMargin, this.doc.y)
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica');

      // Task stats with proper alignment
      currentY = this.doc.y;
      this.doc
        .text(`Total Tasks: ${project.totalTasks}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`Completed: ${project.completedTasks}`, rightColumnX, currentY, { width: 250 });
      
      currentY += 20;
      this.doc.y = currentY;

      this.doc
        .text(`Overdue Tasks: ${project.overdueTasks}`, leftMargin, currentY, { width: 250 });
      this.doc
        .text(`Approaching Deadlines: ${project.approachingDeadlines}`, rightColumnX, currentY, { width: 250 });
      
      this.doc.y = currentY + 30;

      // Overdue tasks table if available
      if (project.tasks && project.tasks.length > 0) {
        this.doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Overdue Tasks', leftMargin, this.doc.y)
          .moveDown(0.5);

        this.createSimpleTable(
          ['Task Name', 'Due Date', 'Days Overdue'],
          project.tasks.slice(0, 8).map((task: any) => [
            task.subject.length > 40 ? task.subject.substring(0, 37) + '...' : task.subject,
            new Date(task.dueDate).toLocaleDateString(),
            `${task.daysOverdue} days`
          ])
        );

        if (project.tasks.length > 8) {
          this.doc
            .fontSize(10)
            .text(`... and ${project.tasks.length - 8} more overdue tasks`, leftMargin, this.doc.y)
            .moveDown(0.5);
        }
      }
    });

    // Move to bottom of page for footer
    this.doc.y = this.doc.page.height - 100;

    // Simple footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, leftMargin, this.doc.y, { 
        align: 'center',
        width: pageWidth - 100
      })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, leftMargin, this.doc.y, { 
        align: 'center',
        width: pageWidth - 100
      });

    // Finalize the PDF
    this.doc.end();
}

  private addHeader(text: string) {
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(text, { align: 'center' })
      .moveDown(1);

    // Add a line under the header
    this.doc
      .lineWidth(1)
      .moveTo(50, this.doc.y)
      .lineTo(this.doc.page.width - 50, this.doc.y)
      .stroke()
      .moveDown(1);
  }
}

export const pdfGenerator = new PDFGenerator();