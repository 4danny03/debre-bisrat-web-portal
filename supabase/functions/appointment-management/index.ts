import { createClient } from '@supabase/supabase-js';
// @ts-expect-error Import from Deno standard library is supported in Supabase Edge runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// --- Helper: Send notification (stub, replace with actual email/SMS integration) ---
async function sendNotification(type: string, payload: any) {
  // TODO: Integrate with email/SMS provider or Supabase function
  console.log(`[Notification] Type: ${type}`, payload);
}

// --- Helper: Log audit events ---
async function logAudit(action: string, entity: string, entityId: string, userId?: string) {
  // TODO: Insert into audit_log table or external logging
  console.log(`[Audit] ${action} on ${entity} (${entityId}) by ${userId ?? 'public'}`);
}

// --- Helper: Rate limiting (simple in-memory, replace with Redis for prod) ---
const rateLimitMap = new Map<string, { count: number; last: number }>();
function isRateLimited(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > windowMs) {
    rateLimitMap.set(ip, { count: 1, last: now });
    return false;
  }
  if (entry.count >= limit) return true;
  rateLimitMap.set(ip, { count: entry.count + 1, last: entry.last });
  return false;
}

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
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
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
        // Rate limit public requests
        if (!user && isRateLimited(ip)) {
          throw new Error('Too many requests. Please try again later.');
        }
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
        // Insert appointment
        const { data: newAppointment, error: createError } = await supabaseClient
          .from('appointments')
          .insert([
            {
              ...data,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
        if (createError) throw createError;
        // Audit log
        await logAudit('create', 'appointment', newAppointment.id, user?.id);
        // Notify admin
        await sendNotification('appointment_created', newAppointment);
        result = { appointment: newAppointment };
        break;
      }
      case 'update': {
        if (!user) throw new Error('Unauthorized');
        const { id, ...updates } = data || {};
        // Allow status workflow: confirmed, completed, cancelled
        const status = typeof updates.status === 'string' ? updates.status : undefined;
        if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
          throw new Error('Invalid status');
        }
        // Allow admin notes
        const { data: updated, error: updateError } = await supabaseClient
          .from('appointments')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (updateError) throw updateError;
        await logAudit('update', 'appointment', String(id), user?.id);
        await sendNotification('appointment_updated', updated);
        result = { appointment: updated };
        break;
      }
      case 'delete': {
        if (!user) throw new Error('Unauthorized');
        const { id } = data || {};
        const { error: deleteError } = await supabaseClient
          .from('appointments')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        await logAudit('delete', 'appointment', String(id), user?.id);
        await sendNotification('appointment_deleted', { id });
        result = { success: true };
        break;
      }
      case 'export_calendar': {
        if (!user) throw new Error('Unauthorized');
        // TODO: Implement calendar export (Google/iCal integration)
        result = { url: 'https://calendar.example.com/export.ics' };
        break;
      }
      default:
        throw new Error('Unknown action');
    }

    // Monitoring/logging stub
    console.log(`[API] Action: ${action} by ${user?.id ?? 'public'} at ${new Date().toISOString()}`);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[API] Error:', errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
// API versioning and monitoring can be expanded here
