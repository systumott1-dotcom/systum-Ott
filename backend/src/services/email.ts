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
