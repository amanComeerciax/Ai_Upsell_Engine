import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
    console.log('\n🔍 Testing Email Configuration...');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ NOT SET'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Step 1: Verify SMTP connection
    console.log('\n📡 Verifying SMTP connection...');
    try {
        await transporter.verify();
        console.log('   ✅ SMTP connection successful!');
    } catch (err: any) {
        console.error('   ❌ SMTP connection FAILED:', err.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Make sure 2-Step Verification is ON in your Google Account');
        console.log('   2. App Password must be 16 chars with no spaces');
        console.log('   3. Go to: https://myaccount.google.com/apppasswords');
        process.exit(1);
    }

    // Step 2: Send a real test email
    console.log('\n📧 Sending test email to:', process.env.EMAIL_USER);
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: '✅ Velocity AI Engine — Email Test',
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
                    <h2 style="color:#1a1a1a;">🎉 Email is Working!</h2>
                    <p style="color:#374151;">Your Velocity AI Engine email service is configured correctly.</p>
                    <p style="color:#374151;">Post-purchase upsell emails will now be sent automatically when customers place orders on your Shopify store.</p>
                    <div style="background:#dcfce7;padding:16px;border-radius:8px;margin-top:16px;">
                        <strong style="color:#16a34a;">✅ Configuration Verified</strong><br/>
                        <small style="color:#166534;">EMAIL_USER: ${process.env.EMAIL_USER}</small>
                    </div>
                </div>
            `,
        });
        console.log('   ✅ Test email sent! Message ID:', info.messageId);
        console.log('\n🎯 Check your inbox at:', process.env.EMAIL_USER);
    } catch (err: any) {
        console.error('   ❌ Send failed:', err.message);
        process.exit(1);
    }

    console.log('\n✅ All email tests passed! You are ready to go.\n');
}

testEmail();
