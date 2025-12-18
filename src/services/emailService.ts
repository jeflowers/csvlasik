import { supabase } from '../lib/supabase';

interface QueueEmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
  replyTo?: string;
  scheduledFor?: Date;
  maxAttempts?: number;
}

export const emailService = {
  async queueEmail(options: QueueEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: options.to,
          from_email: options.from || 'noreply@csvlasik.com',
          subject: options.subject,
          html_body: options.htmlBody,
          text_body: options.textBody,
          reply_to: options.replyTo,
          status: 'pending',
          attempts: 0,
          max_attempts: options.maxAttempts || 3,
          scheduled_for: options.scheduledFor?.toISOString() || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error queueing email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error queueing email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async processQueue(): Promise<{ success: boolean; processed?: number; error?: string }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/process-email-queue-gmail`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process email queue');
      }

      const result = await response.json();
      return { success: true, processed: result.processed };
    } catch (error) {
      console.error('Error processing email queue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    sent: number;
    failed: number;
  }> {
    const [pending, processing, sent, failed] = await Promise.all([
      supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
      supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
      supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    ]);

    return {
      pending: pending.count || 0,
      processing: processing.count || 0,
      sent: sent.count || 0,
      failed: failed.count || 0,
    };
  },
};
