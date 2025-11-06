import type { ConsultationRequest, ConsultationSettings } from '../../types/Consultation';
import { supabase } from '../../lib/supabase';
import { auditService } from './auditService';

export class NotificationService {
  async notifyRecipients(
    request: ConsultationRequest,
    settings: ConsultationSettings
  ): Promise<void> {
    if (settings.routing_mode === 'notify_all') {
      await this.notifyAllRecipients(request, settings);
    } else if (settings.routing_mode === 'round_robin') {
      await this.notifyAssignedRecipient(request, settings);
    }
  }

  private async notifyAllRecipients(
    request: ConsultationRequest,
    settings: ConsultationSettings
  ): Promise<void> {
    const recipients = await this.getRecipientEmails(settings.recipient_user_ids);

    for (const recipient of recipients) {
      if (settings.notification_email) {
        await this.sendEmailNotification(recipient.email, request);
      }

      if (settings.notification_sms && recipient.phone) {
        await this.sendSMSNotification(recipient.phone, request);
      }
    }

    await auditService.logAction(request.id, 'contacted', {
      notification_type: 'all_recipients',
      recipient_count: recipients.length,
    });
  }

  private async notifyAssignedRecipient(
    request: ConsultationRequest,
    settings: ConsultationSettings
  ): Promise<void> {
    if (!request.assigned_to_user_id) return;

    const { data: user } = await supabase
      .from('users')
      .select('email, phone')
      .eq('id', request.assigned_to_user_id)
      .single();

    if (!user) return;

    if (settings.notification_email) {
      await this.sendEmailNotification(user.email, request);
    }

    if (settings.notification_sms && user.phone) {
      await this.sendSMSNotification(user.phone, request);
    }

    await auditService.logAction(request.id, 'contacted', {
      notification_type: 'assigned_recipient',
      recipient_id: request.assigned_to_user_id,
    });
  }

  private async getRecipientEmails(
    userIds: string[]
  ): Promise<Array<{ email: string; phone?: string }>> {
    const { data, error } = await supabase
      .from('users')
      .select('email, phone')
      .in('id', userIds);

    if (error) {
      console.error('Failed to get recipient emails:', error);
      return [];
    }

    return data || [];
  }

  private async sendEmailNotification(
    to: string,
    request: ConsultationRequest
  ): Promise<void> {
    const subject = `New LASIK Consultation Request — ${request.first_name} ${request.last_name}`;

    const body = `
      <h2>New Consultation Request</h2>

      <h3>Patient Information:</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.first_name} ${request.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Procedure:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.procedure}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Preferred Contact:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.preferred_contact}</td>
        </tr>
        ${
          request.comments
            ? `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Comments:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.comments}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding: 8px;"><strong>Submitted:</strong></td>
          <td style="padding: 8px;">${new Date(request.created_at).toLocaleString()}</td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        <a href="${window.location.origin}/admin/appointments"
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View in Appointments Dashboard
        </a>
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 14px;">
        ClearSight LASIK<br>
        Dr. Charles Flowers
      </p>
    `;

    try {
      const { error } = await supabase.functions.invoke('send-consultation-email', {
        body: { to, subject, html: body },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send email notification:', err);
    }
  }

  private async sendSMSNotification(to: string, request: ConsultationRequest): Promise<void> {
    const message = `New LASIK consult: ${request.first_name} ${request.last_name} ${request.phone}\nProcedure: ${request.procedure}\nCheck Admin → Appointments to schedule.\n\nMsg & data rates may apply. Reply STOP to opt out.`;

    try {
      const { error } = await supabase.functions.invoke('send-consultation-sms', {
        body: { to, message },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send SMS notification:', err);
    }
  }

  async sendTestNotification(
    recipientEmail: string,
    recipientPhone?: string,
    includeEmail = true,
    includeSMS = false
  ): Promise<{ email: boolean; sms: boolean }> {
    const testRequest: ConsultationRequest = {
      id: 'test-' + Date.now(),
      practice_id: null,
      first_name: 'Test',
      last_name: 'Patient',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      procedure: 'LASIK',
      preferred_contact: 'email',
      comments: 'This is a test notification.',
      status: 'unassigned',
      assigned_to_user_id: null,
      scheduled_via: null,
      ringcentral_event_id: null,
      ringcentral_message_id: null,
      submission_ip: null,
      duplicate_suppressed: false,
      duplicate_of_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const results = { email: false, sms: false };

    if (includeEmail) {
      try {
        await this.sendEmailNotification(recipientEmail, testRequest);
        results.email = true;
      } catch (err) {
        console.error('Test email failed:', err);
      }
    }

    if (includeSMS && recipientPhone) {
      try {
        await this.sendSMSNotification(recipientPhone, testRequest);
        results.sms = true;
      } catch (err) {
        console.error('Test SMS failed:', err);
      }
    }

    return results;
  }
}

export const notificationService = new NotificationService();
