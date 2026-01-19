import nodemailer from 'nodemailer';
import { supabase } from '../services/supabase/config';
import {
  processBirthdayTriggers,
  getPendingEmails,
  updateEmailStatus,
  getSMTPConfig
} from '../services/supabase/emailService';

async function sendEmail(
  to: string, 
  subject: string, 
  content: string, 
  smtpConfig: any
): Promise<void> {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465, // true for 465, false for other ports
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
  });

  // Send email
  try {
    await transporter.sendMail({
      from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
      to,
      subject,
      html: content,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function processPendingEmails(): Promise<void> {
  console.log('Processing pending emails...');
  
  // Get SMTP configuration
  const smtpConfig = await getSMTPConfig();
  if (!smtpConfig) {
    console.error('No SMTP configuration found. Exiting...');
    return;
  }
  
  // Get pending emails (limit to 50 at a time)
  const pendingEmails = await getPendingEmails(50);
  console.log(`Found ${pendingEmails.length} pending emails`);
  
  // Process each email
  for (const email of pendingEmails) {
    try {
      console.log(`Sending email to ${email.to} with subject: ${email.subject}`);
      
      // Send the email
      await sendEmail(
        email.to,
        email.subject,
        email.content,
        smtpConfig
      );
      
      // Update status to sent
      await updateEmailStatus(email.id, 'sent');
      console.log(`Successfully sent email ${email.id}`);
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);
      
      // Update status to failed with error message
      await updateEmailStatus(
        email.id, 
        'failed', 
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

async function runTriggers(): Promise<void> {
  console.log('Running email triggers...');
  
  try {
    // Process birthday emails
    const birthdayCount = await processBirthdayTriggers();
    console.log(`Queued ${birthdayCount} birthday emails`);
    
    // Note: New lead and meeting triggers are processed when those events happen
    // They are not part of the scheduled worker
  } catch (error) {
    console.error('Error processing triggers:', error);
  }
}

async function main(): Promise<void> {
  console.log('Starting email worker...');
  
  try {
    // Run triggers to generate new emails
    await runTriggers();
    
    // Process pending emails
    await processPendingEmails();
    
    console.log('Email worker completed successfully');
  } catch (error) {
    console.error('Error in email worker:', error);
  } finally {
    // Close Supabase connection
    await supabase.auth.signOut();
  }
}

// Execute worker when run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error in email worker:', error);
      process.exit(1);
    });
}

// Export for programmatic use (e.g. testing)
export { main, sendEmail, processPendingEmails, runTriggers }; 