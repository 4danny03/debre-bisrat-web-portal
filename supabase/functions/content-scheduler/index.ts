import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  corsHeaders,
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  verifyAdminAccess,
} from "../_shared/utils.ts";

dotenv.config();

const app = express();
app.use(express.json());

const supabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

app.post(
  "/content-scheduler",
  async (req: Request, res: Response) => {
    try {
      const { action, contentId } = req.body;

      // Verify admin authentication and role
      await verifyAdminAccess(supabaseClient, req.headers.authorization || null);

      if (action === "pending") {
        // Get pending scheduled content
        const { data: pendingContent, error } = await supabaseClient
          .from("scheduled_content")
          .select("*")
          .eq("status", "scheduled")
          .lte("scheduled_for", new Date().toISOString())
          .order("scheduled_for", { ascending: true });

        if (error) throw error;

        return res.status(200).json({ content: pendingContent });
      } else if (contentId) {
        // Get specific scheduled content
        const { data: content, error } = await supabaseClient
          .from("scheduled_content")
          .select("*")
          .eq("id", contentId)
          .single();

        if (error) throw error;

        return res.status(200).json({ content });
      } else {
        // Get all scheduled content
        const status = req.query.status as string;
        const type = req.query.type as string;
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "20");
        const offset = (page - 1) * limit;

        let query = supabaseClient
          .from("scheduled_content")
          .select("*", { count: "exact" })
          .order("scheduled_for", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }
        if (type) {
          query = query.eq("type", type);
        }

        const { data: content, error, count } = await query;

        if (error) throw error;

        return res.status(200).json({
          content,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }

      return res.status(400).send({ error: "Invalid request" });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  }
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
