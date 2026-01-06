import { sendEmail } from "./email.ts";
import { sendSms } from "./sms.ts";

function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function normalizeEmail(v?: string | null) {
  const s = (v ?? "").trim();
  return s ? s : null;
}

function normalizePhone(v?: string | null) {
  const s = (v ?? "").trim();
  return s ? s : null;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type PaymentType = "donation" | "membership";

function money(amountCents: number, currency: string) {
  const amount = (amountCents / 100).toFixed(2);
  return `${amount} ${currency.toUpperCase()}`;
}

function donationEmailHtml(params: {
  name: string;
  amountText: string;
  reference: string;
  churchName: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Thank you for your donation, ${escapeHtml(params.name)}!</h2>

    <p>We are grateful for your generosity. Your gift helps support the ministry and serve our community.</p>

    <p><b>Amount:</b> ${escapeHtml(params.amountText)}</p>
    <p><b>Reference:</b> ${escapeHtml(params.reference)}</p>

    <hr />

    <p><b>“Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.”</b><br/>
    — 2 Corinthians 9:7</p>

    <p><b>“And my God will meet all your needs according to the riches of his glory in Christ Jesus.”</b><br/>
    — Philippians 4:19</p>

    <p>Thank you again. May the Lord bless you and keep you.</p>

    <p style="margin-top: 24px;">
      With gratitude,<br/>
      <b>${escapeHtml(params.churchName)}</b>
    </p>
  </div>`;
}

function membershipEmailHtml(params: {
  name: string;
  membershipType: string;
  amountText: string;
  reference: string;
  churchName: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Thank you, ${escapeHtml(params.name)} — your membership payment is confirmed!</h2>

    <p>We’re grateful to have you as part of our church family. Your membership supports the work of the ministry and strengthens our community.</p>

    <p><b>Membership:</b> ${escapeHtml(params.membershipType)}</p>
    <p><b>Amount:</b> ${escapeHtml(params.amountText)}</p>
    <p><b>Reference:</b> ${escapeHtml(params.reference)}</p>

    <hr />

    <p><b>“Let us consider how we may spur one another on toward love and good deeds, not giving up meeting together…”</b><br/>
    — Hebrews 10:24–25</p>

    <p><b>“Therefore encourage one another and build each other up…”</b><br/>
    — 1 Thessalonians 5:11</p>

    <p>God bless you, and welcome.</p>

    <p style="margin-top: 24px;">
      With love,<br/>
      <b>${escapeHtml(params.churchName)}</b>
    </p>
  </div>`;
}

export async function notifyOnPayment(params: {
  paymentType: PaymentType;
  amountCents: number;
  currency: string;
  payerName?: string | null;
  payerEmail?: string | null;
  payerPhone?: string | null;
  referenceId?: string | null;
  membershipType?: string | null;
}) {
  const adminEmails = requireEnv("ADMIN_NOTIFY_EMAIL")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean); // church inbox
  const churchName = requireEnv("CHURCH_NAME");

  const payerEmail = normalizeEmail(params.payerEmail);
  const payerPhone = normalizePhone(params.payerPhone);

  const payerName = (params.payerName ?? "Friend").trim();
  const amountText = money(params.amountCents, params.currency);
  const reference = params.referenceId ?? "N/A";

  // Church email (ALWAYS)
  await sendEmail({
    to: adminEmails,
    subject: `[${params.paymentType.toUpperCase()}] Received ${amountText}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New ${escapeHtml(params.paymentType)} received</h2>
        <p><b>Amount:</b> ${escapeHtml(amountText)}</p>
        <p><b>Name:</b> ${escapeHtml(payerName)}</p>
        <p><b>Email:</b> ${escapeHtml(payerEmail ?? "(not provided)")}</p>
        <p><b>Phone:</b> ${escapeHtml(payerPhone ?? "(not provided)")}</p>
        <p><b>Reference:</b> ${escapeHtml(reference)}</p>
      </div>
    `,
  });

  // Payer notifications (conditional)
  const results: {
    payerEmailed: boolean;
    payerTexted: boolean;
    smsSkippedReason?: string;
  } = { payerEmailed: false, payerTexted: false };

  // Email payer if they provided email
  if (payerEmail) {
    if (params.paymentType === "donation") {
      await sendEmail({
        to: payerEmail,
        subject: "Thank you for your donation — God bless you",
        html: donationEmailHtml({
          name: payerName,
          amountText,
          reference,
          churchName,
        }),
      });
    } else {
      await sendEmail({
        to: payerEmail,
        subject: "Thank you — membership payment received",
        html: membershipEmailHtml({
          name: payerName,
          membershipType: params.membershipType ?? "Membership",
          amountText,
          reference,
          churchName,
        }),
      });
    }
    results.payerEmailed = true;
  }

  // SMS payer if they provided phone
  if (payerPhone) {
    const smsBody =
      params.paymentType === "donation"
        ? `Thank you ${payerName}! We received your donation of ${amountText}. “God loves a cheerful giver” (2 Cor 9:7). ${churchName}`
        : `Thank you ${payerName}! Your membership payment of ${amountText} is confirmed. “Encourage one another” (1 Thes 5:11). ${churchName}`;

    const smsRes = await sendSms({ to: payerPhone, body: smsBody });
    if ((smsRes as any)?.skipped) {
      results.smsSkippedReason = (smsRes as any).reason ?? "Skipped";
    } else {
      results.payerTexted = true;
    }
  }

  return results;
}
