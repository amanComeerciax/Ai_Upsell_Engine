import nodemailer from 'nodemailer';

// ─── Email Service ─────────────────────────────────────────────────────────
// Uses Gmail SMTP (or any SMTP). Configure via .env:
//   EMAIL_USER=your@gmail.com
//   EMAIL_PASS=your-app-password   (Gmail App Password, NOT your real password)
//   EMAIL_FROM="Velocity AI <your@gmail.com>"

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || '',
            },
        });
    }

    /**
     * Sends a post-purchase upsell email to the customer.
     * Called immediately after a upsell_event is created by the webhook.
     */
    async sendUpsellEmail(params: {
        to: string;
        customerName: string;
        triggerProductName: string;
        upsellProductName: string;
        upsellProductImage: string | null;
        originalPrice: number;
        discountPercent: number;
        eventId: number;
        expiresAt: Date;
        shopDomain: string;
        customSubject?: string | null;
        customBody?: string | null;
    }): Promise<boolean> {
        const {
            to, customerName, triggerProductName, upsellProductName,
            upsellProductImage, originalPrice, discountPercent,
            eventId, expiresAt, shopDomain, customSubject, customBody
        } = params;

        const discountedPrice = originalPrice * (1 - discountPercent / 100);
        const savings = originalPrice - discountedPrice;

        // Format expiry time
        const expiryStr = expiresAt.toLocaleString('en-IN', {
            weekday: 'long', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
        });

        // The CTA link — points to the store home (widget will auto-load)
        const ctaLink = `https://${shopDomain}/?event_id=${eventId}`;

        // ── Template Parsing ──────────────────────────────────────────────────
        let finalSubject = customSubject || `🎁 ${discountPercent}% off ${upsellProductName} — Exclusive Offer`;
        let finalBody = customBody || `Our AI noticed that customers who buy <strong>${triggerProductName}</strong> love pairing it with this product. We're offering you an exclusive <strong style="color:#3b82f6;">${discountPercent}% discount</strong> — but only for a limited time!`;

        // Replace Placeholders
        const placeholders: Record<string, string> = {
            '{name}': customerName,
            '{product}': triggerProductName,
            '{recommendation}': upsellProductName
        };

        Object.entries(placeholders).forEach(([key, val]) => {
            finalSubject = finalSubject.split(key).join(val);
            finalBody = finalBody.split(key).join(val);
        });

        const productImageHtml = upsellProductImage
            ? `<img src="${upsellProductImage}" alt="${upsellProductName}" style="width:120px;height:120px;object-fit:contain;border-radius:12px;background:#f8fafc;padding:8px;" />`
            : `<div style="width:120px;height:120px;background:#f1f5f9;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;">🛍️</div>`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${finalSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,-apple-system,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:32px 40px;text-align:center;">
                            <div style="font-size:13px;font-weight:800;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">⚡ Velocity AI Engine</div>
                            <h1 style="color:white;font-size:28px;font-weight:900;margin:0;line-height:1.2;font-style:italic;">
                                A Perfect Match<br/>Just For You
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            
                            <!-- Greeting -->
                            <p style="color:#374151;font-size:16px;margin:0 0 24px;">
                                Hi <strong>${customerName}</strong> 👋
                            </p>
                            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                                ${finalBody}
                            </p>

                            <!-- Product Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:32px;border:1px solid #e2e8f0;">
                                <tr>
                                    <td width="136" valign="top">
                                        ${productImageHtml}
                                    </td>
                                    <td style="padding-left:20px;" valign="middle">
                                        <div style="font-size:18px;font-weight:800;color:#1a1a1a;margin-bottom:8px;line-height:1.3;">
                                            ${upsellProductName}
                                        </div>
                                        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
                                            <span style="font-size:24px;font-weight:900;color:#3b82f6;">
                                                ₹${discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </span>
                                            <span style="font-size:15px;text-decoration:line-through;color:#94a3b8;font-weight:600;">
                                                ₹${originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <div style="background:#dcfce7;color:#16a34a;font-size:12px;font-weight:800;padding:4px 12px;border-radius:8px;display:inline-block;">
                                            You save ₹${savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${ctaLink}" 
                                           style="display:inline-block;background:linear-gradient(135deg,#1a1a1a,#3b3b3b);color:white;text-decoration:none;padding:18px 48px;border-radius:16px;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:0.04em;">
                                            Claim My ${discountPercent}% Discount →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Timer Warning -->
                            <p style="text-align:center;color:#ef4444;font-size:13px;font-weight:700;margin:20px 0 0;">
                                ⏰ Offer expires: ${expiryStr}
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">
                                This offer was generated by Velocity AI Engine.<br/>
                                You received this because you recently placed an order.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        try {
            const fromAddress = process.env.EMAIL_FROM || `"Velocity AI" <${process.env.EMAIL_USER}>`;

            await this.transporter.sendMail({
                from: fromAddress,
                to,
                subject: finalSubject,
                html,
            });

            console.log(`[Email Service] ✅ Upsell email sent to ${to} for event ${eventId}`);
            return true;
        } catch (error: any) {
            console.error(`[Email Service] ❌ Failed to send email to ${to}:`, error.message);
            return false;
        }
    }

    /**
     * Quick test to verify SMTP credentials are working
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('[Email Service] ✅ SMTP connection verified');
            return true;
        } catch (error: any) {
            console.warn('[Email Service] ⚠️ SMTP not configured:', error.message);
            return false;
        }
    }
}

export const emailService = new EmailService();
