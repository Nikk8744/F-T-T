import * as cron from 'node-cron';
import { checkAllDeadlines } from "./deadlineNotifications";

// Track running jobs
let deadlineCheckTask: cron.ScheduledTask | null = null;

// Default cron expression
const DEFAULT_CRON_EXPRESSION = '0 0 * * *'; // Run at midnight every day (00:00)
// const INITIAL_DELAY = 60 * 1000; // 1 minute delay on startup for initial run

export function startDeadlineScheduler(cronExpression: string = DEFAULT_CRON_EXPRESSION): void {
  // Stop any existing job
  stopDeadlineScheduler();
  
  console.log(`Starting deadline notification scheduler with cron: ${cronExpression}`);
  
  // Run once after initial delay
//   const initialTimeout = setTimeout(() => {
//     console.log("Running initial deadline check...");
//     checkAllDeadlines();
//   }, INITIAL_DELAY);
  
  // Validate the cron expression
  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression: ${cronExpression}`);
    console.log('Using default cron expression instead (midnight daily)');
    cronExpression = DEFAULT_CRON_EXPRESSION;
  }
  
  // Then schedule according to cron expression
  deadlineCheckTask = cron.schedule(cronExpression, () => {
    const now = new Date();
    console.log(`Running scheduled deadline check at ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    checkAllDeadlines();
  });
  
  console.log(`Next scheduled check will occur according to cron expression: ${cronExpression}`);
}


// Stop the deadline check scheduler
export function stopDeadlineScheduler(): void {
  if (deadlineCheckTask) {
    deadlineCheckTask.stop();
    deadlineCheckTask = null;
    console.log("Deadline notification scheduler stopped");
  }
}


//  Initialize all scheduled jobs
export function initializeScheduledJobs(): void {
  // Default - run at midnight every day
  startDeadlineScheduler();
  
  // Uncomment for testing - runs every minute
  // startDeadlineScheduler('* * * * *');
  
  // More schedulers can be added here
} 