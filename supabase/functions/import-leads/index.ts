import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedLead {
  uid?: string;
  leadCreatedDate?: string;
  studentName: string;
  intake?: string;
  country?: string;
  source?: string;
  mobileNumber?: string;
  currentStage: string;
  remarks?: string;
  counsellors?: string;
  passportStatus?: string;
  errors?: string[];
  warnings?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { leads } = await req.json();

    console.log(`Processing ${leads.length} leads for import`);

    const results = [];
    const errors = [];

    // Get default counselor (Likitha) and manager (Anupriya or admin)
    const { data: counselors } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .ilike('name', '%likitha%')
      .limit(1);

    const defaultCounselor = counselors?.[0];

    const { data: managers } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, profiles(id, name)')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();

    const defaultManager = (managers?.profiles as unknown) as { id: string; name: string } | null;

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];

      // Skip if there are validation errors
      if (lead.errors && lead.errors.length > 0) {
        errors.push(`Row ${i + 1}: ${lead.errors.join(', ')}`);
        continue;
      }

      try {
        // Smart counselor assignment
        let assignedCounselor = null;
        let finalStage = lead.currentStage || 'Yet to Assign';

        if (lead.counsellors) {
          const { data: matchedCounselors } = await supabaseAdmin
            .from('profiles')
            .select('id, name')
            .ilike('name', `%${lead.counsellors}%`)
            .limit(1);

          if (matchedCounselors && matchedCounselors.length > 0) {
            assignedCounselor = matchedCounselors[0];
            finalStage = 'Yet to Contact';
          } else if (defaultCounselor) {
            assignedCounselor = defaultCounselor;
            finalStage = 'Yet to Contact';
          }
        } else if (defaultCounselor) {
          assignedCounselor = defaultCounselor;
          finalStage = 'Yet to Contact';
        }

        // Create lead
        const { data: newLead, error: leadError } = await supabaseAdmin
          .from('leads')
          .insert({
            uid: lead.uid,
            name: lead.studentName,
            phone: lead.mobileNumber,
            country: lead.country,
            intake: lead.intake,
            source: lead.source,
            current_stage: finalStage,
            passport_status: lead.passportStatus,
            counselor_uuid: assignedCounselor?.id,
            counsellors: assignedCounselor?.name,
            manager_uuid: defaultManager?.id,
            created_at: lead.leadCreatedDate || new Date().toISOString(),
          })
          .select()
          .single();

        if (leadError) {
          console.error(`Error creating lead for row ${i + 1}:`, leadError);
          errors.push(`Row ${i + 1}: ${leadError.message}`);
          continue;
        }

        // Create remark if exists
        if (lead.remarks && newLead) {
          const remarkUserId = assignedCounselor?.id || defaultManager?.id || user.id;
          await supabaseAdmin.from('remarks').insert({
            lead_id: newLead.id,
            content: `CSV Import: ${lead.remarks}`,
            user_uuid: remarkUserId,
            user_id: 0, // Legacy field
          });
        }

        // Create stage history if stage was assigned
        if (finalStage !== 'Yet to Assign' && newLead) {
          const historyUserId = assignedCounselor?.id || defaultManager?.id || user.id;
          await supabaseAdmin.from('stage_history').insert({
            lead_id: newLead.id,
            from_stage: null,
            to_stage: finalStage,
            user_uuid: historyUserId,
            user_id: 0, // Legacy field
            reason: `Imported and assigned to ${assignedCounselor?.name || 'default counselor'}`,
            created_at: lead.leadCreatedDate || new Date().toISOString(),
          });
        }

        results.push(newLead);
      } catch (error) {
        console.error(`Error processing lead at row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Import complete. Imported: ${results.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: results.length,
        errors,
        leads: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
