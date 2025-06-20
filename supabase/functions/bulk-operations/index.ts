import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "@shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const { operation, table, data, ids, filters } = await req.json();

    let result: any = {};

    switch (operation) {
      case "bulk_import":
        if (!Array.isArray(data)) {
          throw new Error("Data must be an array for bulk import");
        }

        // Process in batches to avoid timeout
        const batchSize = 100;
        let totalProcessed = 0;
        const errors: any[] = [];

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);

          try {
            const { error } = await supabaseClient.from(table).insert(batch);

            if (error) {
              errors.push({ batch: i / batchSize + 1, error: error.message });
            } else {
              totalProcessed += batch.length;
            }
          } catch (batchError) {
            errors.push({
              batch: i / batchSize + 1,
              error: String(batchError),
            });
          }
        }

        result = {
          operation: "bulk_import",
          table,
          totalRecords: data.length,
          processed: totalProcessed,
          errors: errors.length,
          errorDetails: errors,
        };
        break;

      case "bulk_export":
        const { data: exportData, error: exportError } = await supabaseClient
          .from(table)
          .select("*");

        if (exportError) throw exportError;

        result = {
          operation: "bulk_export",
          table,
          recordCount: exportData?.length || 0,
          data: exportData,
          exportedAt: new Date().toISOString(),
        };
        break;

      case "bulk_delete":
        if (!Array.isArray(ids) || ids.length === 0) {
          throw new Error("IDs array is required for bulk delete");
        }

        const { error: deleteError } = await supabaseClient
          .from(table)
          .delete()
          .in("id", ids);

        if (deleteError) throw deleteError;

        result = {
          operation: "bulk_delete",
          table,
          deletedCount: ids.length,
          deletedIds: ids,
        };
        break;

      case "bulk_update":
        if (!data || !filters) {
          throw new Error("Data and filters are required for bulk update");
        }

        let query = supabaseClient.from(table).update(data);

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { error: updateError, count } = await query;

        if (updateError) throw updateError;

        result = {
          operation: "bulk_update",
          table,
          updatedCount: count || 0,
          updateData: data,
          filters,
        };
        break;

      case "bulk_email":
        const { subject, content, recipientType = "all" } = data;

        if (!subject || !content) {
          throw new Error("Subject and content are required for bulk email");
        }

        // Get recipients based on type
        let recipients: any[] = [];

        if (recipientType === "subscribers") {
          const { data: subscribersData } = await supabaseClient
            .from("email_subscribers")
            .select("email, name")
            .eq("status", "active");
          recipients = subscribersData || [];
        } else if (recipientType === "members") {
          const { data: membersData } = await supabaseClient
            .from("members")
            .select("email, full_name")
            .not("email", "is", null)
            .eq("membership_status", "active");
          recipients =
            membersData?.map((m) => ({ email: m.email, name: m.full_name })) ||
            [];
        }

        // Create email campaign record
        const { data: campaign, error: campaignError } = await supabaseClient
          .from("email_campaigns")
          .insert({
            name: `Bulk Email - ${new Date().toLocaleDateString()}`,
            subject,
            content,
            status: "sent",
            recipient_count: recipients.length,
            sent_count: recipients.length,
            sent_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (campaignError) throw campaignError;

        result = {
          operation: "bulk_email",
          campaignId: campaign.id,
          recipientCount: recipients.length,
          subject,
          sentAt: new Date().toISOString(),
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return formatSuccessResponse(result);
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
