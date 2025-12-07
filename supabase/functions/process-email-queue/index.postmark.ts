import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

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

interface PostmarkEmailRequest {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody?: string;
  ReplyTo?: string;
  MessageStream: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');

    if (!postmarkApiKey) {
      throw new Error('POSTMARK_API_KEY environment variable is not set');
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

    const results = [];

    for (const email of emails as EmailQueueItem[]) {
      try {
        await supabase
          .from('email_queue')
          .update({ status: 'processing', attempts: email.attempts + 1 })
          .eq('id', email.id);

        const postmarkRequest: PostmarkEmailRequest = {
          From: email.from_email || 'noreply@clearsightvision.com',
          To: email.to_email,
          Subject: email.subject,
          HtmlBody: email.html_body,
          MessageStream: 'outbound',
        };

        if (email.text_body) {
          postmarkRequest.TextBody = email.text_body;
        }
        if (email.reply_to) {
          postmarkRequest.ReplyTo = email.reply_to;
        }

        const response = await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': postmarkApiKey,
          },
          body: JSON.stringify(postmarkRequest),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();

        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'sent', messageId: result.MessageID });
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
