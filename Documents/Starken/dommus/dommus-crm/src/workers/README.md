# Email Worker

This worker processes email triggers and sends pending emails from the queue.

## Features

- Processes birthday triggers daily to queue emails for leads with birthdays today
- Sends all pending emails from the queue using configured SMTP settings
- Updates email status (sent or failed) based on the outcome
- Logs detailed information for monitoring and debugging

## Requirements

- Node.js 14+
- TypeScript
- nodemailer package
- Valid SMTP configuration in the database

## Running the worker

### Manual execution

You can run the worker manually with:

```bash
npm run email-worker
```

This will:
1. Process all birthday triggers and queue emails if needed
2. Send all pending emails in the queue
3. Update statuses accordingly

### Setting up as a cron job

For production use, it's recommended to set up the worker as a cron job to run automatically.

#### Linux/Unix (using crontab)

1. Create a shell script wrapper (e.g., `run-email-worker.sh`):

```bash
#!/bin/bash
cd /path/to/your/project
npm run email-worker
```

2. Make the script executable:

```bash
chmod +x run-email-worker.sh
```

3. Edit your crontab:

```bash
crontab -e
```

4. Add a line to run the worker at desired intervals (e.g., every hour):

```
0 * * * * /path/to/your/project/run-email-worker.sh >> /path/to/your/project/logs/email-worker.log 2>&1
```

#### Windows (using Task Scheduler)

1. Create a batch file (e.g., `run-email-worker.bat`):

```batch
cd /d C:\path\to\your\project
npm run email-worker
```

2. Open Task Scheduler
3. Create a Basic Task
   - Name: "Email Worker"
   - Trigger: Daily (set desired time)
   - Action: Start a program
   - Program/script: `C:\path\to\your\project\run-email-worker.bat`

## Logging

The worker provides detailed logging to the console:
- Startup and completion messages
- Number of birthday emails queued
- Number of pending emails processed
- Success and failure logs for each email
- Error details in case of failures

For production, redirect the output to a log file as shown in the cron example above.

## Extending

To add more trigger types:
1. Create a processor function in `emailService.ts`
2. Add it to the `runTriggers()` function in `emailWorker.ts`
3. Ensure the trigger is properly set up in the database

## Troubleshooting

Common issues:
- **No emails sent**: Check SMTP configuration in the database
- **Connection errors**: Verify network access and SMTP credentials
- **Missing templates**: Ensure email templates exist for each trigger type
- **Worker execution**: Check if cron/task scheduler is properly set up 