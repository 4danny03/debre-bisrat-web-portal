import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // Ensure only POST requests are accepted
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  try {
    // Parse the incoming request body
    const { client_full_name, client_email, client_phone, appointment_date, appointment_time, service_type, notes } = await req.json();
    // Validate required fields
    if (!client_full_name || !client_email || !appointment_date || !appointment_time || !service_type) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Create Supabase client with anonymous access
    // Use service role key for backend operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseKey) {
      return new Response(JSON.stringify({
        error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), supabaseKey);
    // Insert appointment request
    const { data, error } = await supabase.from('apointment').insert({
      client_full_name,
      client_email,
      client_phone: client_phone || null,
      appointment_date: new Date(appointment_date),
      appointment_time,
      service_type,
      status: 'pending',
      notes: notes || null
    }).select();
    if (error) throw error;
    // Return successful response
    return new Response(JSON.stringify(data[0]), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 201
    });
  } catch (err) {
    console.error('Appointment request error:', err);
    return new Response(JSON.stringify({
      error: 'Failed to create appointment request',
      details: err.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
