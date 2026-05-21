const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Mimic the EmailService
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }

  async sendUpsellEmail(params) {
    const {
      to, customerName, triggerProductName, upsellProductName,
      upsellProductImage, originalPrice, discountPercent,
      personalizedPitch, eventId, expiresAt, shopDomain, customSubject, customBody
    } = params;

    console.log('[Diagnostics] Email params prepared:', { to, customerName, triggerProductName, upsellProductName });

    const discountedPrice = originalPrice * (1 - discountPercent / 100);
    const savings = originalPrice - discountedPrice;

    const expiryStr = expiresAt.toLocaleString('en-IN', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
    });

    const ctaLink = `https://${shopDomain}/?event_id=${eventId}`;
    let finalSubject = customSubject || `🎁 ${discountPercent}% off ${upsellProductName} — Exclusive Offer`;
    const defaultBody = personalizedPitch || `Our AI noticed that you love this!`;
    let finalBody = customBody || defaultBody;

    const placeholders = {
      '{name}': customerName,
      '{product}': triggerProductName,
      '{recommendation}': upsellProductName
    };

    Object.entries(placeholders).forEach(([key, val]) => {
      if (val) {
        finalSubject = finalSubject.split(key).join(val);
        finalBody = finalBody.split(key).join(val);
      }
    });

    const html = `<h1>Hello ${customerName}</h1><p>${finalBody}</p><p><a href="${ctaLink}">Claim Discount</a></p>`;

    try {
      const fromAddress = process.env.EMAIL_FROM || `"Velocity AI" <${process.env.EMAIL_USER}>`;
      console.log('[Diagnostics] Attempting SMTP sendMail from:', fromAddress, 'to:', to);

      const info = await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject: finalSubject,
        html,
      });

      console.log(`[Email Service] ✅ Upsell email sent to ${to} for event ${eventId}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Service] ❌ Failed to send email to ${to}:`, error.message);
      return false;
    }
  }
}

async function main() {
  console.log('--- DIAGNOSING EMAIL FOR EVENT ID 61 ---');
  
  // Fetch event 61
  const event = await prisma.upsell_events.findUnique({
    where: { id: 61 },
    include: {
      products: true,
      users: true,
      orders: true
    }
  });

  if (!event) {
    console.error('Event ID 61 not found in database!');
    return;
  }

  console.log('Event details fetched successfully.');

  const emailService = new EmailService();
  
  await emailService.sendUpsellEmail({
    to: event.users?.email || 'guest@example.com',
    customerName: event.users?.name || 'Customer',
    triggerProductName: 'Anti-Fog Swimming Goggles', // Trigger product name
    upsellProductName: event.products?.name || 'Yoga Block Set (2-Pack)',
    upsellProductImage: event.products?.image_url || null,
    originalPrice: Number(event.products?.price || 0),
    discountPercent: event.discount_percent || 15,
    personalizedPitch: event.pitch,
    eventId: event.id,
    expiresAt: event.expires_at || new Date(),
    shopDomain: 'navjivan-kirana-store.myshopify.com'
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
