export async function onRequestPost(context) {
  try {
    const { env } = context;
    const MP_ACCESS_TOKEN = env.MP_ACCESS_TOKEN;

    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const origin = new URL(context.request.url).origin;

    const preference = {
      items: [
        {
          id: "sistema-light-retro",
          title: "Sistema Light Retro - EmulaPlays",
          quantity: 1,
          currency_id: "CLP",
          unit_price: 10000,
        },
      ],
      back_urls: {
        success: origin + "/api/payment-success",
        pending: origin + "/api/payment-success",
        failure: origin + "/retro/index.html",
      },
      auto_return: "approved",
      notification_url: origin + "/api/webhooks/mercadopago",
      external_reference: "sistema-light-retro",
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

    return new Response(JSON.stringify({ 
      ok: mpResponse.ok, 
      status: mpResponse.status,
      init_point: data.init_point || null,
      id: data.id || null,
      error: data.message || null
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
