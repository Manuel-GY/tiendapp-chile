const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const { env } = context;
    const MP_ACCESS_TOKEN = env.MP_ACCESS_TOKEN;

    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN not configured", debug: Object.keys(env || {}) }), {
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

    const { product } = body;

    if (!product || !product.id || !product.title || !product.price) {
      return new Response(JSON.stringify({ error: "Missing required product fields" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    if (typeof product.price !== "number" || product.price <= 0) {
      return new Response(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const preference = {
      items: [
        {
          id: product.id,
          title: product.title,
          description: product.description || "",
          quantity: 1,
          currency_id: "CLP",
          unit_price: product.price,
        },
      ],
      back_urls: {
        success: `${origin}/api/payment-success`,
        pending: `${origin}/api/payment-success`,
        failure: `${origin}/retro/index.html`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/webhooks/mercadopago`,
      external_reference: product.id,
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to create payment preference", mp_error: data }), {
        status: 502,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error", message: error.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
