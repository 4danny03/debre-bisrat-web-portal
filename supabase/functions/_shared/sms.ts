function getEnv(name: string) {
  return (Deno.env.get(name) ?? "").trim();
}

export async function sendSms(params: { to: string; body: string }) {
  const apiKey = getEnv("BREEZE_API_KEY");
  const subdomain = getEnv("BREEZE_SUBDOMAIN");

  if (!apiKey || !subdomain) {
    return { skipped: true, reason: "Missing BREEZE_API_KEY or BREEZE_SUBDOMAIN" };
  }

  // Breeze expects specific payload fields; adjust if your Breeze API requires different format.
  const res = await fetch(`https://${subdomain}.breezechms.com/api/texts/send`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: params.to,
      message: params.body,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Breeze SMS error ${res.status}: ${text}`);
  }

  return await res.json();
}
