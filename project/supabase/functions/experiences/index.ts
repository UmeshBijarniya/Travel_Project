import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const experienceId = pathSegments[pathSegments.length - 1];

    if (experienceId && experienceId !== 'experiences') {
      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', experienceId)
        .maybeSingle();

      if (expError) throw expError;
      if (!experience) {
        return new Response(
          JSON.stringify({ error: 'Experience not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: slots, error: slotsError } = await supabase
        .from('experience_slots')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('is_active', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (slotsError) throw slotsError;

      return new Response(
        JSON.stringify({ experience, slots }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify({ experiences }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});