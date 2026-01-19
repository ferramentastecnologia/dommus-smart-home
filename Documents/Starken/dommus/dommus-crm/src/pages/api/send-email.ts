import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { to, subject, html, smtp } = req.body;
    
    if (!to || !subject || !html || !smtp) {
      return res.status(400).json({ error: 'Incomplete parameters' });
    }
    
    const { host, port, secure, auth, from } = smtp;
    
    if (!host || !port || !auth?.user || !auth?.pass || !from?.email) {
      return res.status(400).json({ error: 'Incomplete SMTP configuration' });
    }
    
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: auth.user,
        pass: auth.pass
      }
    });
    
    // Send the email
    const info = await transporter.sendMail({
      from: from.name ? `"${from.name}" <${from.email}>` : from.email,
      to,
      subject,
      html
    });
    
    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Error sending email', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 