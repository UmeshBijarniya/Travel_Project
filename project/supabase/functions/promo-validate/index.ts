import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { code, subtotal } = await req.json();

    if (!code || !subtotal) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code and subtotal are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!promoCode) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid promo code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Promo code has expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let discountAmount = 0;
    if (promoCode.discount_type === 'percentage') {
      discountAmount = (subtotal * promoCode.discount_value) / 100;
    } else if (promoCode.discount_type === 'fixed') {
      discountAmount = Math.min(promoCode.discount_value, subtotal);
    }

    return new Response(
      JSON.stringify({
        valid: true,
        code: promoCode.code,
        discountAmount: Number(discountAmount.toFixed(2)),
        discountType: promoCode.discount_type,
        discountValue: promoCode.discount_value,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});