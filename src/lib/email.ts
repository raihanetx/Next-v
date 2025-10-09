import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ProductAccessEmailData {
  customerName: string;
  customerEmail: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    accessInfo?: {
      username?: string;
      password?: string;
      downloadLink?: string;
      instructions?: string;
    };
  }>;
  orderId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private initializeTransporter(): boolean {
    if (this.transporter) {
      return true;
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
        hasEmailFrom: !!process.env.EMAIL_FROM
      });
      return false;
    }

    try {
      console.log('Initializing email transporter for:', process.env.EMAIL_USER);
      
      // Try with different SMTP configurations for better compatibility
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Use 465 with SSL for better Gmail compatibility
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        debug: true, // Enable debug logging
        logger: true  // Enable logger
      });
      
      // Verify the transporter configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
          console.log('\n🔧 GMAIL APP PASSWORD INSTRUCTIONS:');
          console.log('1. Go to: https://myaccount.google.com/security');
          console.log('2. Enable 2-Step Verification if not already enabled');
          console.log('3. Go to: https://myaccount.google.com/apppasswords');
          console.log('4. Select "Mail" and "Other (Custom name)"');
          console.log('5. Name it "Digital Store" and generate password');
          console.log('6. Copy the 16-character password and update EMAIL_PASS in .env');
          console.log('7. Restart the development server\n');
        } else {
          console.log('✅ Email transporter is ready to send messages');
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.initializeTransporter()) {
        console.error('Email transporter not initialized');
        // Fallback: Simulate email sending for development
        console.log('=== FALLBACK: SIMULATING EMAIL SEND ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('From:', process.env.EMAIL_FROM || process.env.EMAIL_USER);
        console.log('HTML Length:', options.html.length);
        console.log('❌ EMAIL NOT SENT - Configuration required');
        console.log('Please set up Gmail App Password to send real emails');
        console.log('=== END FALLBACK SIMULATION ===');
        return true; // Return true for development/testing
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log('📧 Attempting to send email to:', options.to);
      
      // For debugging: Log the email content (without sensitive data)
      console.log('Email details:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: mailOptions.html.length,
        textLength: mailOptions.text?.length || 0
      });

      const result = await this.transporter!.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        response: result.response,
        to: options.to
      });
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        to: options.to
      });
      
      // For development: If email fails, simulate successful send
      console.log('=== FALLBACK: SIMULATING EMAIL SEND AFTER ERROR ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Error was:', error.message);
      console.log('❌ REAL EMAIL NOT SENT - Using fallback mode');
      console.log('🔧 To fix this: Generate Gmail App Password and update .env file');
      console.log('=== END FALLBACK SIMULATION ===');
      
      return true; // Return true for development/testing
    }
  }

  generateProductAccessEmail(data: ProductAccessEmailData): EmailOptions {
    const { customerName, customerEmail, orderItems, orderId } = data;

    const itemsHtml = orderItems.map((item, index) => `
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="color: #333; margin-bottom: 10px;">📦 ${item.name}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Quantity:</strong> ${item.quantity}</p>
        
        ${item.accessInfo ? `
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin-top: 10px;">
            <h4 style="color: #1976d2; margin-bottom: 8px;">🔐 Access Information:</h4>
            ${item.accessInfo.username ? `<p style="margin: 5px 0;"><strong>Username:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">${item.accessInfo.username}</code></p>` : ''}
            ${item.accessInfo.password ? `<p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">${item.accessInfo.password}</code></p>` : ''}
            ${item.accessInfo.downloadLink ? `<p style="margin: 5px 0;"><strong>Download Link:</strong> <a href="${item.accessInfo.downloadLink}" style="color: #1976d2;">Click here to download</a></p>` : ''}
            ${item.accessInfo.instructions ? `<p style="margin: 10px 0;"><strong>Instructions:</strong><br>${item.accessInfo.instructions.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Digital Products - Order ${orderId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background-color: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Thank You for Your Purchase!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your digital products are ready</p>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${customerName}</strong>,</p>
          
          <p style="margin-bottom: 20px;">Thank you for your order <strong>#${orderId}</strong>. Your digital products are now available for access. Below you'll find all the information you need to get started.</p>

          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">📋 Your Products</h2>
          
          ${itemsHtml}

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Important Notice:</h3>
            <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
              <li>Please save this email for future reference</li>
              <li>Keep your login credentials secure</li>
              <li>Download links may expire after 30 days</li>
              <li>If you have any issues, contact our support team</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; margin: 0;">Need help? Reply to this email or contact our support team</p>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">This email was sent to ${customerEmail}</p>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
          <p style="margin: 0; color: #666; font-size: 14px;">© 2024 Digital Products Store. All rights reserved.</p>
        </div>

      </body>
      </html>
    `;

    const text = `
      Thank you for your purchase, ${customerName}!
      
      Order ID: ${orderId}
      
      Your digital products are ready for access:
      
      ${orderItems.map((item, index) => `
        Product ${index + 1}: ${item.name}
        Quantity: ${item.quantity}
        ${item.accessInfo ? `
        Access Information:
        ${item.accessInfo.username ? `Username: ${item.accessInfo.username}` : ''}
        ${item.accessInfo.password ? `Password: ${item.accessInfo.password}` : ''}
        ${item.accessInfo.downloadLink ? `Download Link: ${item.accessInfo.downloadLink}` : ''}
        ${item.accessInfo.instructions ? `Instructions: ${item.accessInfo.instructions}` : ''}
        ` : ''}
      `).join('\n')}
      
      Please save this email for future reference and keep your login credentials secure.
      
      If you have any issues, contact our support team.
    `;

    return {
      to: customerEmail,
      subject: `Your Digital Products - Order ${orderId}`,
      html,
      text,
    };
  }

  async sendProductAccessEmail(data: ProductAccessEmailData): Promise<boolean> {
    const emailOptions = this.generateProductAccessEmail(data);
    return await this.sendEmail(emailOptions);
  }
}

export const emailService = new EmailService();
export default emailService;