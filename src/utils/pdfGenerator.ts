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

    // Add header
    this.addHeader(`Project Report: ${project.name}`);
    this.doc.moveDown(1);

    // Project summary section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Project Summary', { align: 'center' })
      .moveDown(1);

    this.doc
      .fontSize(12)
      .font('Helvetica');

    // Row 1: Status and Completion
    this.doc
      .text(`Status: ${project.status}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`Completion: ${completionPercentage}%`, { width: 250, align: 'right' })
      .moveDown(0.5);

    // Row 2: Timeline
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set';
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';

    this.doc
      .text(`Start Date: ${startDate}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`End Date: ${endDate}`, { width: 250, align: 'right' })
      .moveDown(0.5);

    // Row 3: Team and Tasks
    this.doc
      .text(`Team Members: ${membersCount}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`Total Tasks: ${totalTasks}`, { width: 250, align: 'right' })
      .moveDown(1.5);

    // Task distribution section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Task Status Distribution')
      .moveDown(0.5);

    this.createSimpleTable(
      ['Status', 'Count', 'Percentage'],
      taskStats.map((stat: { status: string; count: number }) => [
        stat.status || 'Unset',
        String(stat.count),
        `${Math.round((Number(stat.count) / totalTasks) * 100)}%`
      ])
    );

    this.doc.moveDown(1);

    // Simple footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, { align: 'center' });

    // Finalize the PDF
    this.doc.end();
  }

  generateTaskReport(data: any, res: Response, title: string = 'Task Report') {
    console.log("generateTaskReporttttt", data.statusDistribution);

    // Create a new PDF document
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=task-report-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    this.doc.pipe(res);

    // Add header
    this.addHeader(title);
    this.doc.moveDown(1);

    // Status Distribution
    if (data.statusDistribution) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Task Status Distribution')
        .moveDown(0.5);

      this.createSimpleTable(
        ['Status', 'Count'],
        data.statusDistribution.distribution.map((stat: any) => [
          stat.status || 'Unset',
          String(stat.count)
        ])
      );

      this.doc.moveDown(1);
    }

    // Priority Analysis
    if (data.priorityAnalysis) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Priority Analysis')
        .moveDown(0.5);

      this.createSimpleTable(
        ['Priority', 'Total', 'Completed', 'Completion Rate'],
        data.priorityAnalysis.map((item: any) => [
          item.priority,
          String(item.total),
          String(item.completed),
          `${item.completionRate}%`
        ])
      );

      this.doc.moveDown(1);
    }

    // Overdue Tasks
    if (data.overdueTasks && data.overdueTasks.length > 0) {
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Overdue Tasks')
        .moveDown(0.5);

      this.createSimpleTable(
        ['Task', 'Project', 'Due Date', 'Days Overdue'],
        data.overdueTasks.map((task: any) => [
          task.subject.length > 35 ? task.subject.substring(0, 32) + '...' : task.subject,
          task.projectName?.length > 25 ? task.projectName.substring(0, 22) + '...' : (task.projectName || 'N/A'),
          new Date(task.dueDate).toLocaleDateString(),
          `${task.daysOverdue} days`
        ])
      );

      this.doc.moveDown(1);
    }

    // Simple footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, { align: 'center' });

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

    // Summary stats in proper rows
    this.doc
      .fontSize(12)
      .font('Helvetica');

    // Row 1
    this.doc
      .text(`Total Projects: ${summary.totalProjects}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`Completed Projects: ${summary.completedProjects} (${summary.projectCompletionRate}%)`, { width: 250, align: 'right' })
      .moveDown(0.5);

    // Row 2
    this.doc
      .text(`Total Tasks: ${summary.totalTasks}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`Completed Tasks: ${summary.completedTasks} (${summary.taskCompletionRate}%)`, { width: 250, align: 'right' })
      .moveDown(0.5);

    // Row 3
    this.doc
      .text(`Overdue Tasks: ${summary.overdueTasks}`, 50, this.doc.y, { width: 250, continued: true })
      .text(`Approaching Deadlines: ${summary.approachingDeadlines}`, { width: 250, align: 'right' })
      .moveDown(1.5);

    // Projects overview section
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Projects Overview')
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

      // Project header
      this.doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`Project: ${project.name}`)
        .moveDown(0.5);

      // Project details in organized rows
      this.doc
        .fontSize(12)
        .font('Helvetica');

      // Row 1: Status and Completion
      this.doc
        .text(`Status: ${project.status}`, 50, this.doc.y, { width: 250, continued: true })
        .text(`Completion: ${project.completionPercentage}%`, { width: 250, align: 'right' })
        .moveDown(0.5);

      // Row 2: Team and Role
      this.doc
        .text(`Team Members: ${project.teamMembers}`, 50, this.doc.y, { width: 250, continued: true })
        .text(`Your Role: ${project.isOwner ? 'Owner' : 'Member'}`, { width: 250, align: 'right' })
        .moveDown(0.5);

      // Row 3: Timeline
      const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set';
      const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set';

      this.doc
        .text(`Start Date: ${startDate}`, 50, this.doc.y, { width: 250, continued: true })
        .text(`End Date: ${endDate}`, { width: 250, align: 'right' })
        .moveDown(0.5);

      // Description
      if (project.description) {
        this.doc
          .text(`Description: ${project.description}`, { width: 500 })
          .moveDown(0.5);
      }

      this.doc.moveDown(1);

      // Task summary
      this.doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Task Summary')
        .moveDown(0.5);

      this.doc
        .fontSize(12)
        .font('Helvetica');

      // Task stats in rows
      this.doc
        .text(`Total Tasks: ${project.totalTasks}`, 50, this.doc.y, { width: 250, continued: true })
        .text(`Completed: ${project.completedTasks}`, { width: 250, align: 'right' })
        .moveDown(0.5);

      this.doc
        .text(`Overdue Tasks: ${project.overdueTasks}`, 50, this.doc.y, { width: 250, continued: true })
        .text(`Approaching Deadlines: ${project.approachingDeadlines}`, { width: 250, align: 'right' })
        .moveDown(1);

      // Overdue tasks table if available
      if (project.tasks && project.tasks.length > 0) {
        this.doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Overdue Tasks')
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
            .text(`... and ${project.tasks.length - 8} more overdue tasks`)
            .moveDown(0.5);
        }
      }
    });

    // Simple footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.3)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, { align: 'center' });

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