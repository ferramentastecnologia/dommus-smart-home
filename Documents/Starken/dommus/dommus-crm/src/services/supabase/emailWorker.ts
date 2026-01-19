import { supabase } from './config';
import {
  getPendingEmails,
  updateEmailStatus,
  getActiveTemplatesByTrigger,
  processBirthdayTriggers,
  processNewLeadTriggers,
  processMeetingTriggers
} from './emailService';

// Configuration interface for the email worker
export interface EmailWorkerConfig {
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  };
  checkInterval: number; // milliseconds
  maxRetries: number;
  maxEmailsPerBatch: number;
}

// Worker state
let isRunning = false;
let worker: NodeJS.Timeout | null = null;
let transporter: any = null;

// Default configuration
const defaultConfig: EmailWorkerConfig = {
  smtpConfig: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  checkInterval: 60000, // Check every minute
  maxRetries: 3,
  maxEmailsPerBatch: 10
};

let config = { ...defaultConfig };

/**
 * Initializes the email transporter with the provided SMTP configuration
 */
const initializeTransporter = () => {
  // This would be implemented with actual email library
  if (!transporter) {
    transporter = {
      sendMail: async (options: any) => {
        console.log('Would send email with options:', options);
        return { messageId: 'mock-message-id-' + Date.now() };
      }
    };
  }
  return transporter;
};

/**
 * Sends a single email using the configured transporter
 */
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const transport = initializeTransporter();
    
    const mailOptions = {
      from: config.smtpConfig.auth.user,
      to,
      subject,
      html
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Processes the email queue
 */
const processEmailQueue = async (): Promise<void> => {
  try {
    console.log('Processing email queue...');
    
    // Get pending emails from the queue
    const pendingEmails = await getPendingEmails(config.maxEmailsPerBatch);
    
    if (pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return;
    }
    
    console.log(`Found ${pendingEmails.length} pending emails to process`);
    
    // Process each email
    for (const email of pendingEmails) {
      try {
        // Send the email
        const success = await sendEmail(email.to, email.subject, email.content);
        
        if (success) {
          // Update the status to sent
          await updateEmailStatus(email.id, 'sent', null, config.maxRetries);
        } else {
          // Update the status to failed
          await updateEmailStatus(email.id, 'failed', 'Failed to send email', config.maxRetries);
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        // Update the status to failed with error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updateEmailStatus(email.id, 'failed', errorMessage, config.maxRetries);
      }
    }
    
    console.log('Email queue processing completed');
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
};

/**
 * Processes active email triggers
 */
const processEmailTriggers = async (): Promise<void> => {
  try {
    console.log('Processing email triggers...');
    
    // Get active templates for each trigger type
    const birthdayTemplates = await getActiveTemplatesByTrigger('birthday');
    const newLeadTemplates = await getActiveTemplatesByTrigger('new_lead');
    const meetingTemplates = await getActiveTemplatesByTrigger('meeting');
    
    // Process birthday emails
    for (const template of birthdayTemplates) {
      await processBirthdayTriggers(template.id);
    }
    
    // Process new lead emails
    for (const template of newLeadTemplates) {
      await processNewLeadTriggers(template.id);
    }
    
    // Process meeting emails
    for (const template of meetingTemplates) {
      await processMeetingTriggers(template.id);
    }
    
    console.log('Email triggers processing completed');
  } catch (error) {
    console.error('Error processing email triggers:', error);
  }
};

/**
 * The worker function that runs at the specified interval
 */
const workerFunction = async () => {
  if (!isRunning) {
    return;
  }
  
  try {
    // Process triggers to generate new emails
    await processEmailTriggers();
    
    // Process the email queue
    await processEmailQueue();
  } catch (error) {
    console.error('Error in email worker:', error);
  } finally {
    // Schedule the next run if still running
    if (isRunning && worker) {
      clearTimeout(worker);
      worker = setTimeout(workerFunction, config.checkInterval);
    }
  }
};

/**
 * Starts the email worker
 */
export const startEmailWorker = (customConfig?: Partial<EmailWorkerConfig>): void => {
  if (isRunning) {
    console.log('Email worker is already running');
    return;
  }
  
  // Apply custom configuration if provided
  if (customConfig) {
    config = { 
      ...config, 
      ...customConfig,
      smtpConfig: { ...config.smtpConfig, ...(customConfig.smtpConfig || {}) }
    };
  }
  
  console.log('Starting email worker with config:', config);
  
  // Initialize the transporter
  initializeTransporter();
  
  // Set running state
  isRunning = true;
  
  // Start the worker
  worker = setTimeout(workerFunction, 0); // Start immediately
  
  console.log('Email worker started');
};

/**
 * Stops the email worker
 */
export const stopEmailWorker = (): void => {
  if (!isRunning) {
    console.log('Email worker is not running');
    return;
  }
  
  console.log('Stopping email worker');
  
  // Clear the worker timeout
  if (worker) {
    clearTimeout(worker);
    worker = null;
  }
  
  // Set running state
  isRunning = false;
  
  console.log('Email worker stopped');
};

/**
 * Returns the current status of the email worker
 */
export const getEmailWorkerStatus = (): { isRunning: boolean; config: EmailWorkerConfig } => {
  return {
    isRunning,
    config
  };
};

/**
 * Updates the email worker configuration
 */
export const updateEmailWorkerConfig = (customConfig: Partial<EmailWorkerConfig>): void => {
  // Apply custom configuration
  config = { 
    ...config, 
    ...customConfig,
    smtpConfig: { ...config.smtpConfig, ...(customConfig.smtpConfig || {}) }
  };
  
  console.log('Email worker configuration updated:', config);
  
  // Reinitialize the transporter if SMTP config changed
  if (customConfig.smtpConfig) {
    transporter = null;
    initializeTransporter();
  }
  
  // Restart the worker if it's running
  if (isRunning) {
    stopEmailWorker();
    startEmailWorker();
  }
}; 