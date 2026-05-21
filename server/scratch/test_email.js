const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

async function main() {
  console.log('Testing Email Service...');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '********' : 'NOT SET'}`);
  
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');
    
    const info = await transporter.sendMail({
      from: `"Velocity AI Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Velocity AI Test Email',
      text: 'SMTP credentials are working perfectly!'
    });
    console.log('✅ Test email sent successfully! MessageId:', info.messageId);
  } catch (err) {
    console.error('❌ Email Service test failed:', err.message);
  }
}

main();
