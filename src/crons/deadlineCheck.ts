#!/usr/bin/env node

/**
 * This is a standalone script to manually run deadline checks.
 * Can be executed directly from command line:
 * npx ts-node src/jobs/deadlineCheck.ts
 * 
 * You can also test the cron scheduling by passing a --cron flag:
 * npx ts-node src/jobs/deadlineCheck.ts --cron="* * * * *"
 * 
 * This will run the check once immediately and then according to the cron schedule.
 */

import dotenv from 'dotenv';
dotenv.config();

import * as cron from 'node-cron';
import { checkAllDeadlines } from './deadlineNotifications';

// Parse command line arguments
const args = process.argv.slice(2);
const cronArg = args.find(arg => arg.startsWith('--cron='));
const cronExpression = cronArg ? cronArg.split('=')[1] : null;

// Function to run the deadline check
const runDeadlineCheck = async () => {
  console.log(`Manual deadline check started at ${new Date().toISOString()}`);
  
  try {
    await checkAllDeadlines();
    console.log('Manual deadline check completed successfully');
    
    if (!cronExpression) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during manual deadline check:', error);
    
    if (!cronExpression) {
      process.exit(1);
    }
  }
};

// If a cron expression is provided, schedule the checks
if (cronExpression) {
  console.log(`Setting up cron schedule with expression: ${cronExpression}`);
  
  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression: ${cronExpression}`);
    process.exit(1);
  }
  
  // Run once immediately
  runDeadlineCheck();
  
  // Then schedule according to the cron expression
  cron.schedule(cronExpression, runDeadlineCheck);
  
  console.log(`Deadline checks will run according to schedule: ${cronExpression}`);
  console.log('Press Ctrl+C to exit');
} else {
  // Just run once and exit
  runDeadlineCheck();
} 