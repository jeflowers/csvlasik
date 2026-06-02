import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qdcykazqmowkmkhykepb.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3lrYXpxbW93a21raHlrZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQwNzEsImV4cCI6MjA3NTQ0MDA3MX0.lDeWRNri-hPV6JMH2tRiwvYrN64hOKYuGUhre6rQeaA';

export const TEST_MARKER = '[TEST-DATA-TESTIMONIAL]';
const TEST_RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const TEST_EMAIL = `testimonial.test.${TEST_RUN_ID}@atelier-test.local`;
const TEST_PASSWORD = `Tt!${TEST_RUN_ID}_aZ9`;

const isLiveDb = SUPABASE_URL.includes('supabase.co') && !SUPABASE_URL.includes('test.supabase.co');
const describeLive = isLiveDb ? describe : describe.skip;

describeLive('testimonials: insert via authenticated client', () => {
  let client: SupabaseClient;
  let insertedId: number | null = null;
  let userId: string | null = null;

  beforeAll(async () => {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data, error } = await client.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error) throw error;
    userId = data.user?.id ?? null;
  });

  afterAll(async () => {
    if (insertedId !== null) {
      await client.from('testimonials').delete().eq('id', insertedId).then(() => {}, () => {});
    }
    await client.from('testimonials').delete().like('content', `%${TEST_RUN_ID}%`).then(() => {}, () => {});
    await client?.auth.signOut().catch(() => {});
  });

  it('inserts a testimonial that lands as unapproved (pending review)', async () => {
    const payload = {
      name: `Test Patient ${TEST_RUN_ID}`,
      email: TEST_EMAIL,
      content: `${TEST_MARKER} This is an automated test testimonial. Run: ${TEST_RUN_ID}`,
      rating: 5,
      procedure_type: 'LASIK',
      procedure_date: new Date().toISOString().split('T')[0],
    };

    const { data, error } = await client
      .from('testimonials')
      .insert([payload])
      .select()
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.name).toBe(payload.name);
    expect(data!.content).toContain(TEST_MARKER);
    expect(data!.rating).toBe(5);
    expect(data!.approved).toBe(false);

    insertedId = data!.id;
  });

  it('authenticated user can read the pending testimonial back', async () => {
    expect(insertedId).not.toBeNull();

    const { data, error } = await client
      .from('testimonials')
      .select('id, content, approved')
      .eq('id', insertedId!)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.content).toContain(TEST_MARKER);
    expect(data?.approved).toBe(false);
  });

  it('pending testimonial is NOT visible to anonymous public reads', async () => {
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data } = await anonClient
      .from('testimonials')
      .select('id')
      .eq('id', insertedId!)
      .maybeSingle();

    expect(data).toBeNull();
  });
});
