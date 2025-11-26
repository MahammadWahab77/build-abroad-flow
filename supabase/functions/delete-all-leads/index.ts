import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with user's token for auth check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error('User is not an admin');
    }

    // Use service role client for deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting deletion of all leads and related data...');

    // Delete in order: dependent tables first, then leads
    
    // 1. Delete documents
    const { error: docsError } = await supabaseAdmin
      .from('documents')
      .delete()
      .neq('id', 0); // Delete all
    if (docsError) throw new Error(`Failed to delete documents: ${docsError.message}`);
    console.log('Deleted all documents');

    // 2. Delete remarks
    const { error: remarksError } = await supabaseAdmin
      .from('remarks')
      .delete()
      .neq('id', 0);
    if (remarksError) throw new Error(`Failed to delete remarks: ${remarksError.message}`);
    console.log('Deleted all remarks');

    // 3. Delete stage_history
    const { error: historyError } = await supabaseAdmin
      .from('stage_history')
      .delete()
      .neq('id', 0);
    if (historyError) throw new Error(`Failed to delete stage_history: ${historyError.message}`);
    console.log('Deleted all stage history');

    // 4. Delete tasks
    const { error: tasksError } = await supabaseAdmin
      .from('tasks')
      .delete()
      .neq('id', 0);
    if (tasksError) throw new Error(`Failed to delete tasks: ${tasksError.message}`);
    console.log('Deleted all tasks');

    // 5. Delete university_applications
    const { error: appsError } = await supabaseAdmin
      .from('university_applications')
      .delete()
      .neq('id', 0);
    if (appsError) throw new Error(`Failed to delete university_applications: ${appsError.message}`);
    console.log('Deleted all university applications');

    // 6. Finally delete leads
    const { error: leadsError } = await supabaseAdmin
      .from('leads')
      .delete()
      .neq('id', 0);
    if (leadsError) throw new Error(`Failed to delete leads: ${leadsError.message}`);
    console.log('Deleted all leads');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All leads and related data deleted successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
