import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address required' }, { status: 400 });
    }

    console.log('🧪 Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

    // Test different configurations
    const configs = [
      {
        name: 'Gmail Service (Port 465)',
        config: {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          secure: true,
          debug: true,
          logger: true
        }
      },
      {
        name: 'Gmail SMTP (Port 587)',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false
          },
          debug: true,
          logger: true
        }
      }
    ];

    const results = [];

    for (const testConfig of configs) {
      console.log(`\n🔧 Testing: ${testConfig.name}`);
      
      try {
        const transporter = nodemailer.createTransporter(testConfig.config);
        
        // Test verification
        const verifyResult = await new Promise((resolve, reject) => {
          transporter.verify((error, success) => {
            if (error) {
              reject(error);
            } else {
              resolve(success);
            }
          });
        });

        console.log(`✅ ${testConfig.name}: Verification successful`);

        // Test sending email
        const mailResult = await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: testEmail,
          subject: `🧪 Test Email - ${testConfig.name}`,
          html: `
            <h2>✅ Email Test Successful!</h2>
            <p>This test email was sent using: <strong>${testConfig.name}</strong></p>
            <p>If you receive this email, your Gmail configuration is working correctly.</p>
            <hr>
            <p><small>Sent at: ${new Date().toISOString()}</small></p>
          `,
          text: `Email test successful! This was sent using ${testConfig.name}.`
        });

        console.log(`✅ ${testConfig.name}: Email sent successfully`);
        console.log('Message ID:', mailResult.messageId);

        results.push({
          config: testConfig.name,
          status: 'success',
          messageId: mailResult.messageId,
          response: mailResult.response
        });

      } catch (error: any) {
        console.log(`❌ ${testConfig.name}: Failed`);
        console.log('Error:', error.message);
        
        results.push({
          config: testConfig.name,
          status: 'failed',
          error: error.message,
          code: error.code
        });
      }
    }

    return NextResponse.json({
      success: true,
      testEmail,
      results,
      summary: {
        totalConfigs: configs.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });

  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      error: 'Email test failed', 
      details: error.message 
    }, { status: 500 });
  }
}