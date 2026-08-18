const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function signFlowParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  let toSign = "";
  for (const key of keys) {
    toSign += key + params[key];
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(toSign);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, msgData))
    .then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""));
}

export async function onRequestPost(context) {
  try {
    const { env } = context;
    const FLOW_API_KEY = env.FLOW_API_KEY;
    const FLOW_SECRET_KEY = env.FLOW_SECRET_KEY;
    const isProduction = env.FLOW_MODE === "production";
    const baseUrl = isProduction ? "https://api.flow.cl" : "https://sandbox.flow.cl";

    if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Flow credentials not configured" }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    const origin = new URL(context.request.url).origin;
    let body;
    try {
      body = await context.request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const { product, email } = body;

    if (!product || !product.id || !product.title || !product.price) {
      return new Response(JSON.stringify({ error: "Missing required product fields" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const baseAmount = product.price;
    const FLOW_COMMISSION = 1.0394;
    const finalAmount = Math.round(baseAmount * FLOW_COMMISSION);

    const params = {
      apiKey: FLOW_API_KEY,
      commerceOrder: product.id + "-" + Date.now(),
      subject: product.title,
      currency: "CLP",
      amount: finalAmount,
      email: email || "test@flow.cl",
      urlConfirmation: origin + "/api/webhooks/flow",
      urlReturn: origin + "/api/payment-success",
      optional: JSON.stringify({ baseAmount: baseAmount, commission: Math.round(baseAmount * 0.0394) }),
    };

    const s = await signFlowParams(params, FLOW_SECRET_KEY);
    params.s = s;

    const flowResponse = await fetch(baseUrl + "/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });

    const data = await flowResponse.json();

    if (!flowResponse.ok || !data.url || !data.token) {
      return new Response(JSON.stringify({ error: "Failed to create payment", flow_error: data }), {
        status: 502,
        headers: CORS_HEADERS,
      });
    }

    const redirectUrl = data.url + "?token=" + data.token;

    return new Response(JSON.stringify({ redirect_url: redirectUrl, flowOrder: data.flowOrder }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", message: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
