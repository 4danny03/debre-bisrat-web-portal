import { Resend } from "npm:resend";

function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const from = requireEnv("RESEND_FROM");
  const toList = Array.isArray(params.to) ? params.to : [params.to];

  const res = await resend.emails.send({
    from,
    to: toList,
    subject: params.subject,
    html: params.html,
  });

  return res;
}
