// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';

export class PDFGenerator {
  private doc: PDFKit.PDFDocument;
  
  constructor() {
    this.doc = new PDFDocument({ margin: 50, size: 'A4' });
  }

  generateProjectReport(data: any, res: Response) {
    const { project, taskStats, completionPercentage, membersCount, totalTasks } = data;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=project-report-${project.id}.pdf`);
    
    // Pipe the PDF to the response
    this.doc.pipe(res);
    
    // Add header
    this.addHeader(`Project Report: ${project.name}`);
    
    // Add project summary
    this.doc
      .fontSize(12)
      .text(`Status: ${project.status}`, { continued: true })
      .text(`  Completion: ${completionPercentage}%`, { align: 'right' })
      .moveDown(0.5);
    
    // Project dates
    this.doc
      .text(`Start Date: ${new Date(project.startDate).toLocaleDateString()}`, { continued: true })
      .text(`  End Date: ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}`, { align: 'right' })  
      .moveDown(1);
    
    // Member and task counts
    this.doc
      .text(`Team Members: ${membersCount}`, { continued: true })
      .text(`  Total Tasks: ${totalTasks}`, { align: 'right' })
      .moveDown(1.5);
    
    // Task distribution table
    this.addSubheader('Task Status Distribution');
    
    this.doc.moveDown(0.5);
    this.createTable(
      ['Status', 'Count', 'Percentage'],
      taskStats.map((stat: { status: string; count: number }) => [
        stat.status || 'Unset',
        String(stat.count),
        `${Math.round((Number(stat.count) / totalTasks) * 100)}%`
      ])
    );

    this.doc.moveDown(1.5);
    
    // Footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.5)
      .text(`© ${new Date().getFullYear()} Freelance Task Management`, { align: 'center' });
    
    // Finalize the PDF
    this.doc.end();
  }

  generateTaskReport(data: any, res: Response, title: string = 'Task Report') {
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=task-report-${Date.now()}.pdf`);
    
    // Pipe the PDF to the response
    this.doc.pipe(res);
    
    // Add header
    this.addHeader(title);
    
    // Status Distribution
    if (data.statusDistribution) {
      this.addSubheader('Task Status Distribution');
      
      this.doc.moveDown(0.5);
      this.createTable(
        ['Status', 'Count'],
        data.statusDistribution.map((stat: any) => [
          stat.status || 'Unset',
          String(stat.count)
        ])
      );
      
      this.doc.moveDown(1.5);
    }
    
    // Priority Analysis
    if (data.priorityAnalysis) {
      this.addSubheader('Priority Analysis');
      
      this.doc.moveDown(0.5);
      this.createTable(
        ['Priority', 'Total', 'Completed', 'Completion Rate'],
        data.priorityAnalysis.map((item: any) => [
          item.priority,
          String(item.total),
          String(item.completed),
          `${item.completionRate}%`
        ])
      );
      
      this.doc.moveDown(1.5);
    }
    
    // Overdue Tasks
    if (data.overdueTasks && data.overdueTasks.length > 0) {
      this.addSubheader('Overdue Tasks');
      
      this.doc.moveDown(0.5);
      this.createTable(
        ['Task', 'Project', 'Due Date', 'Days Overdue'],
        data.overdueTasks.map((task: any) => [
          task.subject.substring(0, 30) + (task.subject.length > 30 ? '...' : ''),
          task.projectName?.substring(0, 20) || 'N/A',
          new Date(task.dueDate).toLocaleDateString(),
          String(task.daysOverdue),
        //   task.priority || 'None'
        ])
      );
      
      this.doc.moveDown(1.5);
    }
    
    // Footer
    this.doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.5)
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

  private addSubheader(text: string) {
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(text)
      .font('Helvetica')
      .moveDown(0.5);
  }

  private createTable(headers: string[], rows: string[][]) {
    const columnWidth = (this.doc.page.width - 100) / headers.length;
    
    // Draw header row
    this.doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      this.doc.text(header, 50 + (i * columnWidth), this.doc.y, {
        width: columnWidth,
        align: 'left'
      });
    });
    
    this.doc.moveDown(0.5);
    
    // Draw separator line
    this.doc
      .lineWidth(0.5)
      .moveTo(50, this.doc.y)
      .lineTo(this.doc.page.width - 50, this.doc.y)
      .stroke()
      .moveDown(0.5);
    
    // Draw data rows
    this.doc.font('Helvetica');
    rows.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (this.doc.y > this.doc.page.height - 150) {
        this.doc.addPage();
      }
      
      const rowY = this.doc.y;
      
      // Draw each cell
      row.forEach((cell, i) => {
        this.doc.text(cell, 50 + (i * columnWidth), rowY, {
          width: columnWidth,
          align: 'left'
        });
      });
      
      // Move down for next row
      this.doc.moveDown(0.5);
      
      // Add light line between rows (except after last row)
      if (rowIndex < rows.length - 1) {
        this.doc
          .lineWidth(0.2)
          .moveTo(50, this.doc.y)
          .lineTo(this.doc.page.width - 50, this.doc.y)
          .opacity(0.7)
          .stroke()
          .opacity(1)
          .moveDown(0.2);
      }
    });
  }
}

export const pdfGenerator = new PDFGenerator();