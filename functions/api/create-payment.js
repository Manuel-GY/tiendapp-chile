export async function onRequestPost(context) {
  try {
    const { env } = context;
    const MP_ACCESS_TOKEN = env.MP_ACCESS_TOKEN;

    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const origin = new URL(context.request.url).origin;
    let body;
    try {
      body = await context.request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { product } = body;

    if (!product || !product.id || !product.title || !product.price) {
      return new Response(JSON.stringify({ error: "Missing required product fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (typeof product.price !== "number" || product.price <= 0) {
      return new Response(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
        success: origin + "/api/payment-success",
        pending: origin + "/api/payment-success",
        failure: origin + "/retro/index.html",
      },
      auto_return: "approved",
      notification_url: origin + "/api/webhooks/mercadopago",
      external_reference: product.id,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + MP_ACCESS_TOKEN,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to create payment preference", mp_error: data }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
