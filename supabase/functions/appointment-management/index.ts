import { createClient } from '@supabase/supabase-js';
// @ts-expect-error Import from Deno standard library is supported in Supabase Edge runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// @ts-expect-error Deno global is available in Supabase Edge runtime
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-expect-error Deno global is available in Supabase Edge runtime
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// @ts-expect-error Deno global is available in Supabase Edge runtime
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const parsed: any = await req.json();
    const action: string = parsed.action;
    const data = parsed.data as Record<string, unknown> | undefined;
    const filters = parsed.filters as Record<string, unknown> | undefined;

    // Get authorization header from request (optional for create)
    const authHeader = req.headers.get('Authorization');
    let user = null;
    if (authHeader) {
      // Create client with user's JWT
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });
      const { data: userData, error: userError } = await userClient.auth.getUser();
      if (!userError && userData?.user) user = userData.user;
    }

    let result;

    switch (action) {
      case 'list': {
        if (!user) throw new Error('Unauthorized');
        let query = supabaseClient.from('appointments').select('*');
        // Apply filters if provided
        if (filters) {
          const { status, fromDate, toDate } = filters as any;
          if (status) {
            query = query.eq('status', status);
          }
          if (fromDate) {
            query = query.gte('appointment_date', fromDate);
          }
          if (toDate) {
            query = query.lte('appointment_date', toDate);
          }
        }
        // For regular users, only show their own appointments
        // For admin users, show all appointments
        const { data: adminData } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (!adminData) {
          query = query.eq('user_id', user.id);
        }
        const { data: appointments, error: listError } = await query;
        if (listError) throw listError;
        result = { appointments };
        break;
      }
      case 'create': {
        // Accept public (unauthenticated) requests
        const appointment_date = data?.appointment_date as string | undefined;
        const service_type = data?.service_type as string | undefined;
        const notes = data?.notes as string | undefined;
        const name = data?.name as string | undefined;
        const email = data?.email as string | undefined;
        if (!appointment_date || !service_type) {
          throw new Error('Missing required fields');
        }
        // If not authenticated, require name/email
        if (!user && (!name || !email)) {
          throw new Error('Name and email are required for public requests');
        }
        const insertData = {
          user_id: user ? user.id : null,
          appointment_date,
          service_type,
          notes,
          status: 'pending',
          name: user ? null : name,
          email: user ? null : email,
        };
        const { data: newAppointment, error: createError } = await supabaseClient
          .from('appointments')
          .insert([insertData])
          .select()
          .single();
        if (createError) throw createError;
        result = { appointment: newAppointment };
        break;
      }
      case 'update': {
        if (!user) throw new Error('Unauthorized');
        const id = data?.id as string | undefined;
        const updateData = data;
        if (!id) {
          throw new Error('Missing appointment ID');
        }
        // Check if user is authorized to update
        const { data: existingAppointment } = await supabaseClient
          .from('appointments')
          .select('user_id')
          .eq('id', id)
          .single();
        const { data: isAdmin } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (!existingAppointment) {
          throw new Error('Appointment not found');
        }
        if (existingAppointment.user_id !== user.id && !isAdmin) {
          throw new Error('Unauthorized');
        }
        const { data: updatedAppointment, error: updateError } = await supabaseClient
          .from('appointments')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        if (updateError) throw updateError;
        result = { appointment: updatedAppointment };
        break;
      }
      case 'delete': {
        if (!user) throw new Error('Unauthorized');
        const deleteId = data?.id as string | undefined;
        if (!deleteId) {
          throw new Error('Missing appointment ID');
        }
        // Check if user is authorized to delete
        const { data: appointmentToDelete } = await supabaseClient
          .from('appointments')
          .select('user_id')
          .eq('id', deleteId)
          .single();
        if (!appointmentToDelete) {
          throw new Error('Appointment not found');
        }
        const { data: isAdminUser } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (appointmentToDelete.user_id !== user.id && !isAdminUser) {
          throw new Error('Unauthorized');
        }
        const { error: deleteError } = await supabaseClient
          .from('appointments')
          .delete()
          .eq('id', deleteId);
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err instanceof Error) message = err.message;
    else if (typeof err === 'string') message = err;
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
