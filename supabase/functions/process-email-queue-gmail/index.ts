import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import { SMTPClient } from 'npm:emailjs@4.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailQueueItem {
  id: string;
  to_email: string;
  from_email: string | null;
  subject: string;
  html_body: string;
  text_body: string | null;
  reply_to: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const gmailUser = Deno.env.get('GMAIL_SMTP_USER');
    const gmailPassword = Deno.env.get('GMAIL_SMTP_PASSWORD');

    if (!gmailUser || !gmailPassword) {
      throw new Error('GMAIL_SMTP_USER and GMAIL_SMTP_PASSWORD environment variables must be set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', supabase.rpc('max_attempts'))
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No emails to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = new SMTPClient({
      user: gmailUser,
      password: gmailPassword,
      host: 'smtp.gmail.com',
      port: 587,
      tls: true,
    });

    const results = [];

    for (const email of emails as EmailQueueItem[]) {
      try {
        await supabase
          .from('email_queue')
          .update({ status: 'processing', attempts: email.attempts + 1 })
          .eq('id', email.id);

        await client.sendAsync({
          from: email.from_email || gmailUser,
          to: email.to_email,
          subject: email.subject,
          text: email.text_body || '',
          attachment: [
            { data: email.html_body, alternative: true },
          ],
          ...(email.reply_to && { 'reply-to': email.reply_to }),
        });

        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'sent' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        const newAttempts = email.attempts + 1;
        const isFailed = newAttempts >= email.max_attempts;

        await supabase
          .from('email_queue')
          .update({
            status: isFailed ? 'failed' : 'pending',
            error_message: errorMessage,
            attempts: newAttempts,
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'error', error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing email queue:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});