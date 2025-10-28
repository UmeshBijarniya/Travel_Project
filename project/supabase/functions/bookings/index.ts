import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = 'BK-';
  for (let i = 0; i < 8; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      slotId,
      customerName,
      customerEmail,
      customerPhone,
      numGuests,
      promoCode,
      discountAmount,
      totalPrice,
    } = await req.json();

    if (!slotId || !customerName || !customerEmail || !customerPhone || !numGuests || totalPrice === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: slot, error: slotError } = await supabase
      .from('experience_slots')
      .select('*')
      .eq('id', slotId)
      .maybeSingle();

    if (slotError) throw slotError;
    if (!slot) {
      return new Response(
        JSON.stringify({ success: false, error: 'Slot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (slot.available_spots < numGuests) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not enough available spots' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingReference = generateBookingReference();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        num_guests: numGuests,
        promo_code: promoCode || null,
        discount_amount: discountAmount || 0,
        total_price: totalPrice,
        status: 'confirmed',
        booking_reference: bookingReference,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    const { error: updateError } = await supabase
      .from('experience_slots')
      .update({ available_spots: slot.available_spots - numGuests })
      .eq('id', slotId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          bookingReference: booking.booking_reference,
          status: booking.status,
          totalPrice: booking.total_price,
          numGuests: booking.num_guests,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});