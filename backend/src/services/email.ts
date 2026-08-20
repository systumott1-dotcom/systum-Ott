import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('your_resend_api_key')) {
    return null;
  }
  return new Resend(apiKey);
};

export interface SendOrderEmailPayload {
  toEmail: string;
  customerName: string;
  orderId: string;
  items: Array<{ title: string; plan: string; price: number; quantity: number }>;
  totalAmount: number;
  credentials?: string;
  status: string;
}

/**
 * Send order confirmation & digital credentials email via Resend
 */
export const sendOrderEmail = async (payload: SendOrderEmailPayload): Promise<boolean> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`ℹ️ Resend API key not configured. Mocking email delivery to ${payload.toEmail}`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const itemsListHtml = payload.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.title} (${item.plan})</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price * item.quantity}</td>
          </tr>`
      )
      .join('');

    const credentialsHtml = payload.credentials
      ? `<div style="margin: 20px 0; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
          <h3 style="color: #166534; margin-top: 0;">🔑 Your Access Credentials / Keys</h3>
          <pre style="background: #ffffff; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; white-space: pre-wrap;">${payload.credentials}</pre>
        </div>`
      : '';

    await resend.emails.send({
      from: `Systum OTT <${fromEmail}>`,
      to: payload.toEmail,
      subject: `Order #${payload.orderId} Details - Systum OTT India`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">Systum OTT India</h2>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Authorized Digital Subscription Reseller & Sourcing Hub</p>
          </div>

          <p style="color: #1e293b; font-size: 14px;">Hi <strong>${payload.customerName}</strong>,</p>
          <p style="color: #475569; font-size: 13px; line-height: 1.6;">Thank you for your order! Your digital subscription is backed by our 100% full-term replacement warranty.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc; color: #475569;">
                <th style="padding: 10px 8px; text-align: left;">Item</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right; color: #1e293b;">Total Paid:</td>
                <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #16a34a; font-size: 16px;">₹${payload.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          ${credentialsHtml}

          <div style="margin-top: 24px; padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; color: #475569;">
            <p style="margin: 0 0 6px 0;"><strong>Need immediate replacement or have questions?</strong></p>
            <p style="margin: 0;">WhatsApp Support Desk: <a href="https://wa.me/${process.env.WHATSAPP_SUPPORT_PHONE || '919306022703'}" style="color: #7c3aed; font-weight: bold; text-decoration: none;">+${process.env.WHATSAPP_SUPPORT_PHONE || '919306022703'}</a> (9 AM - 11 PM IST)</p>
          </div>

          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px;">
            © ${new Date().getFullYear()} Systum OTT India. Sourced via verified distributor allocations & Eneba licenses.
          </p>
        </div>
      `,
    });

    console.log(`✉️ Email successfully dispatched to ${payload.toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Resend Email Dispatch Error:', error);
    return false;
  }
};

/**
 * Send password reset OTP email to user or admin
 */
export const sendPasswordResetEmail = async (toEmail: string, resetCode: string): Promise<boolean> => {
  const resend = getResendClient();

  if (!resend) {
    console.log(`ℹ️ Resend API key not configured. Mocking password reset email to ${toEmail} with OTP: ${resetCode}`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    await resend.emails.send({
      from: `Systum OTT Security <${fromEmail}>`,
      to: toEmail,
      subject: '🔐 Password Reset Verification Code - Systum OTT',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="color: #7c3aed; margin: 0; font-size: 22px;">Systum OTT Security</h2>
            <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Account Recovery & Security Desk</p>
          </div>

          <p style="color: #1e293b; font-size: 14px; margin-bottom: 12px;">Hello,</p>
          <p style="color: #475569; font-size: 13px; line-height: 1.6;">We received a request to reset the password for your Systum OTT account (<strong>${toEmail}</strong>).</p>
          <p style="color: #475569; font-size: 13px; line-height: 1.6;">Use the secure 6-digit verification code below to reset your password:</p>

          <div style="margin: 24px 0; padding: 18px; background: #f5f3ff; border: 2px dashed #c4b5fd; border-radius: 12px; text-align: center;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #6d28d9; font-family: monospace;">${resetCode}</span>
            <p style="font-size: 11px; color: #7c3aed; margin: 8px 0 0 0; font-weight: 600;">Valid for 15 minutes only</p>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If you did not request this password reset, please ignore this email or reach out to our security team. Your account password remains unchanged.</p>

          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} Systum OTT India · +91 93060 22703
          </p>
        </div>
      `,
    });

    console.log(`✉️ Password reset verification code dispatched to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Password Reset Email Error:', error);
    return false;
  }
};

/**
 * Send test verification email to admin
 */
export const sendTestEmail = async (toEmail: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const result = await resend.emails.send({
      from: `Systum OTT <${fromEmail}>`,
      to: toEmail,
      subject: 'Hello from Systum OTT India! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #7c3aed; margin-top: 0;">Systum OTT Email System Active!</h2>
          <p>Congrats! Your Resend email service is now connected to <strong>Systum OTT India</strong>.</p>
          <p>Order confirmations, license deliveries, and customer receipts will be sent through this pipeline.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Support: +91 93060 22703 | support@systumott.in</p>
        </div>
      `,
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send test email' };
  }
};

export interface AdminOrderReceiptPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{ title: string; plan: string; price: number; quantity: number }>;
  totalAmount: number;
  paymentScreenshotUrl?: string;
  purchaseDate: string;
}

/**
 * Automatically sends complete order receipt and customer dispatch link to Admin's Gmail on every new order
 */
export const sendAdminNewOrderReceiptEmail = async (payload: AdminOrderReceiptPayload): Promise<boolean> => {
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SUPPORT_EMAIL || 'systumott1@gmail.com';

  if (!resend) {
    console.log(`ℹ️ Resend not configured. Mocking new order receipt to admin (${adminEmail}) for Order #${payload.orderId}`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const itemsHtml = payload.items
      .map(
        (i) => `<tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${i.title} (${i.plan})</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${i.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">₹${i.price * i.quantity}</td>
        </tr>`
      )
      .join('');

    const cleanPhone = payload.customerPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${payload.customerName}, thanks for your order #${payload.orderId} on Systum OTT! Here are your credentials:`)}`;

    const screenshotHtml = payload.paymentScreenshotUrl
      ? `<div style="margin: 20px 0; padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a;">📸 Payment Screenshot Proof:</h4>
          <p style="margin: 0 0 10px 0;"><a href="${payload.paymentScreenshotUrl}" target="_blank" style="color: #7c3aed; font-weight: bold; text-decoration: underline;">Open High-Res Screenshot ↗</a></p>
          <div>
            <img src="${payload.paymentScreenshotUrl}" alt="Payment Proof" style="max-width: 100%; max-height: 380px; border-radius: 8px; border: 1px solid #cbd5e1; display: block;" />
          </div>
        </div>`
      : '';

    await resend.emails.send({
      from: `Systum OTT Orders <${fromEmail}>`,
      to: adminEmail,
      subject: `🚨 NEW ORDER #${payload.orderId} (₹${payload.totalAmount}) - ${payload.customerName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">🎉 New Customer Order Received!</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Order ID: <strong>#${payload.orderId}</strong> · ${payload.purchaseDate}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border-radius: 10px; font-size: 13px; color: #334155;">
            <p style="margin: 0 0 6px 0;"><strong>Customer Name:</strong> ${payload.customerName}</p>
            <p style="margin: 0 0 6px 0;"><strong>WhatsApp Number:</strong> <a href="https://wa.me/91${cleanPhone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">+91 ${payload.customerPhone}</a></p>
            ${payload.customerEmail ? `<p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${payload.customerEmail}</p>` : ''}
            <p style="margin: 0;"><strong>Total Amount Paid:</strong> <span style="color: #16a34a; font-size: 16px; font-weight: 800;">₹${payload.totalAmount}</span></p>
          </div>

          <h4 style="margin: 20px 0 8px 0; color: #0f172a;">📦 Ordered Subscriptions:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569;">
                <th style="padding: 10px 8px; text-align: left;">Item</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right; color: #1e293b;">Total:</td>
                <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #16a34a; font-size: 16px;">₹${payload.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          ${screenshotHtml}

          <div style="margin-top: 24px; text-align: center;">
            <a href="${waUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              💬 Open WhatsApp to Deliver Order
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin: 0;">
            Systum OTT Admin Notification Desk · Automated Dispatch System
          </p>
        </div>
      `,
    });

    console.log(`✉️ New order receipt notification successfully sent to Admin (${adminEmail}) for Order #${payload.orderId}`);
    return true;
  } catch (error) {
    console.error('❌ Resend Admin Order Receipt Error:', error);
    return false;
  }
};

