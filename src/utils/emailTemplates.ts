interface AppointmentRequestData {
  name: string;
  email: string;
  phone: string;
  preferredDate?: string;
  message?: string;
  requestId?: string;
}

export const emailTemplates = {
  appointmentConfirmation: (data: AppointmentRequestData): { subject: string; html: string; text: string } => ({
    subject: 'Appointment Request Received - Atelier Vision',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #0ea5e9; font-size: 22px; margin-top: 0; }
            .detail { margin: 10px 0; }
            .label { font-weight: 600; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Atelier Vision</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your Vision, Our Priority</p>
            </div>

            <div class="content">
              <h2>Thank You for Your Appointment Request</h2>

              <p>Dear ${data.name},</p>

              <p>We have received your appointment request and our team will contact you shortly to confirm your appointment details.</p>

              <div class="info-box">
                <strong>📋 Your Request Details:</strong>
                <div class="detail"><span class="label">Name:</span> ${data.name}</div>
                <div class="detail"><span class="label">Email:</span> ${data.email}</div>
                <div class="detail"><span class="label">Phone:</span> ${data.phone}</div>
                ${data.preferredDate ? `<div class="detail"><span class="label">Preferred Date:</span> ${data.preferredDate}</div>` : ''}
                ${data.message ? `<div class="detail"><span class="label">Message:</span> ${data.message}</div>` : ''}
                ${data.requestId ? `<div class="detail"><span class="label">Reference ID:</span> ${data.requestId}</div>` : ''}
              </div>

              <h3 style="color: #0ea5e9; margin-top: 30px;">What's Next?</h3>
              <ul style="color: #4b5563;">
                <li>Our scheduling team will review your request</li>
                <li>You'll receive a confirmation call within 24 business hours</li>
                <li>We'll work with you to find the best appointment time</li>
              </ul>

              <p style="margin-top: 30px;">If you have any immediate questions, please don't hesitate to contact us:</p>
              <p>
                📞 <strong>Phone:</strong> (619) 377-8600<br>
                📧 <strong>Email:</strong> info@clearsightvision.com
              </p>
            </div>

            <div class="footer">
              <p><strong>Atelier Vision Center</strong></p>
              <p>Excellence in Eye Care Since 2005</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This is an automated confirmation. Please do not reply to this email.<br>
                For assistance, contact us at info@clearsightvision.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Atelier Vision - Appointment Request Received

Dear ${data.name},

We have received your appointment request and our team will contact you shortly to confirm your appointment details.

Your Request Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
${data.preferredDate ? `- Preferred Date: ${data.preferredDate}` : ''}
${data.message ? `- Message: ${data.message}` : ''}
${data.requestId ? `- Reference ID: ${data.requestId}` : ''}

What's Next?
- Our scheduling team will review your request
- You'll receive a confirmation call within 24 business hours
- We'll work with you to find the best appointment time

Contact Information:
Phone: (619) 377-8600
Email: info@clearsightvision.com

Atelier Vision Center
Excellence in Eye Care Since 2005

This is an automated confirmation. Please do not reply to this email.
For assistance, contact us at info@clearsightvision.com
    `.trim(),
  }),

  appointmentNotification: (data: AppointmentRequestData): { subject: string; html: string; text: string } => ({
    subject: `New Appointment Request from ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
            .detail { margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px; }
            .label { font-weight: 600; color: #4b5563; display: inline-block; width: 150px; }
            .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔔 New Appointment Request</h2>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Action required from scheduling team</p>
            </div>

            <div class="content">
              <div class="urgent">
                <strong>⚠️ Action Required:</strong> Please contact this patient within 24 hours to confirm their appointment.
              </div>

              <h3 style="color: #0ea5e9;">Patient Information</h3>
              <div class="detail">
                <span class="label">Name:</span> ${data.name}
              </div>
              <div class="detail">
                <span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
              </div>
              <div class="detail">
                <span class="label">Phone:</span> <a href="tel:${data.phone}">${data.phone}</a>
              </div>
              ${data.preferredDate ? `
              <div class="detail">
                <span class="label">Preferred Date:</span> ${data.preferredDate}
              </div>
              ` : ''}
              ${data.message ? `
              <div class="detail">
                <span class="label">Message:</span><br>
                <div style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #e5e7eb; border-radius: 4px;">
                  ${data.message}
                </div>
              </div>
              ` : ''}
              ${data.requestId ? `
              <div class="detail">
                <span class="label">Reference ID:</span> ${data.requestId}
              </div>
              ` : ''}

              <a href="${import.meta.env.VITE_SUPABASE_URL || 'http://localhost:5173'}/admin/appointments" class="button">View in Admin Panel</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Appointment Request - Action Required

Patient Information:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
${data.preferredDate ? `- Preferred Date: ${data.preferredDate}` : ''}
${data.message ? `- Message: ${data.message}` : ''}
${data.requestId ? `- Reference ID: ${data.requestId}` : ''}

ACTION REQUIRED: Please contact this patient within 24 hours to confirm their appointment.

View in admin panel: ${import.meta.env.VITE_SUPABASE_URL || 'http://localhost:5173'}/admin/appointments
    `.trim(),
  }),
};
