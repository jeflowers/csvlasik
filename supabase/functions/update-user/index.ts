import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UpdateUserRequest {
  id: string;
  updates: {
    name?: string;
    role?: string;
    password?: string;
    is_active?: boolean;
    email?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !requestingUser) {
      throw new Error('Unauthorized');
    }

    const { data: adminCheck } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', requestingUser.id)
      .single();

    if (!adminCheck || !['admin', 'super_admin'].includes(adminCheck.role)) {
      throw new Error('Unauthorized: Admin access required');
    }

    const requestData: UpdateUserRequest = await req.json();
    const { id, updates } = requestData;

    if (updates.password) {
      const { error: passwordError } = await supabaseClient.auth.admin.updateUserById(
        id,
        { password: updates.password }
      );
      if (passwordError) {
        throw passwordError;
      }
      delete updates.password;
    }

    if (updates.role) {
      const { data: roleData } = await supabaseClient
        .from('roles')
        .select('id')
        .eq('name', updates.role)
        .single();

      if (roleData) {
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        await supabaseClient
          .from('user_roles')
          .insert({
            user_id: id,
            role_id: roleData.id,
          });
      }
    }

    const { data: userData, error: updateError } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify(userData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});