import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This is a one-time setup function to migrate existing admin users to the new Auth system
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const adminUsers = [
      {
        email: 'gundluru.mahammadwahab@nxtwave.co.in',
        password: 'NxtWave@123',
        name: 'Mahammad Wahab',
        role: 'admin' as const
      },
      {
        email: 'likhitha.nyasala@nxtwave.co.in',
        password: 'NxtWave@123',
        name: 'Likitha',
        role: 'admin' as const
      }
    ]

    const results = []

    for (const user of adminUsers) {
      console.log(`Setting up user: ${user.email}`)

      // Check if already exists
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
      const exists = existingAuthUser?.users.some(u => u.email === user.email)

      if (exists) {
        console.log(`User ${user.email} already exists in Auth, skipping...`)
        results.push({ email: user.email, status: 'already_exists' })
        continue
      }

      // Create Auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError || !authUser.user) {
        console.error(`Failed to create Auth user ${user.email}:`, authError)
        results.push({ email: user.email, status: 'failed', error: authError?.message })
        continue
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          name: user.name,
          is_active: true,
        })

      if (profileError) {
        console.error(`Failed to create profile for ${user.email}:`, profileError)
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        results.push({ email: user.email, status: 'failed', error: 'Profile creation failed' })
        continue
      }

      // Create role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: user.role,
        })

      if (roleError) {
        console.error(`Failed to create role for ${user.email}:`, roleError)
        await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id)
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        results.push({ email: user.email, status: 'failed', error: 'Role creation failed' })
        continue
      }

      console.log(`Successfully set up user: ${user.email}`)
      results.push({ email: user.email, status: 'success', id: authUser.user.id })
    }

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})