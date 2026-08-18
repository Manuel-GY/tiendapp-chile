export async function onRequestGet(context) {
  const { env } = context;
  return new Response(JSON.stringify({ 
    status: "ok", 
    hasMP: !!env.MP_ACCESS_TOKEN,
    hasResend: !!env.RESEND_API_KEY,
    hasFrom: !!env.RESEND_FROM
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
