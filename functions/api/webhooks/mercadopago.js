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
  const { env } = context;
  const MP_ACCESS_TOKEN = env.MP_ACCESS_TOKEN;
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const RESEND_FROM = env.RESEND_FROM || "ventas@tiendappchile.cl";
  const MP_WEBHOOK_SECRET = env.MP_WEBHOOK_SECRET || null;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (MP_WEBHOOK_SECRET) {
    const signature = context.request.headers.get("x-signature");
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (body.type !== "payment") {
    return new Response("OK", { status: 200 });
  }

  const paymentId = body.data?.id;
  if (!paymentId) {
    return new Response("OK", { status: 200 });
  }

  if (!MP_ACCESS_TOKEN) {
    console.error("MP_ACCESS_TOKEN not configured");
    return new Response("OK", { status: 200 });
  }

  try {
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!paymentResponse.ok) {
      console.error("Failed to fetch payment:", paymentResponse.status);
      return new Response("OK", { status: 200 });
    }

    const payment = await paymentResponse.json();

    if (payment.status !== "approved") {
      return new Response("OK", { status: 200 });
    }

    const payerEmail = payment.payer?.email;
    if (!payerEmail) {
      console.error("No payer email in payment:", paymentId);
      return new Response("OK", { status: 200 });
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response("OK", { status: 200 });
    }

    const emailHtml = buildEmailHtml(payment);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `TiendApp Chile <${RESEND_FROM}>`,
        to: [payerEmail],
        subject: "Tu EmulaPlays esta listo - Guia de Instalacion",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Resend error:", emailResponse.status, emailError);
    } else {
      console.log(`Email sent to ${payerEmail} for payment ${paymentId}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error.message || error);
    return new Response("OK", { status: 200 });
  }
}

function buildEmailHtml(payment) {
  const paymentId = payment.id;
  const amount = payment.transaction_amount;
  const date = new Date(payment.date_approved || payment.date_created).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background: #0e1128; font-family: 'Space Grotesk', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0e1128; color: #fff; }
    .header { background: linear-gradient(135deg, #0e1128, #1c2145); padding: 40px 30px; text-align: center; border-bottom: 3px solid #7b2fbe; }
    .logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 10px; }
    .logo span { color: #00c853; }
    .badge { display: inline-block; background: #00c853; color: #000; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; }
    .content { padding: 35px 30px; }
    .success-icon { text-align: center; margin-bottom: 25px; }
    .success-icon .circle { display: inline-block; width: 70px; height: 70px; border-radius: 50%; background: rgba(0,200,83,0.15); border: 3px solid #00c853; line-height: 70px; font-size: 2.2rem; }
    h1 { font-size: 1.4rem; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #b0b3d0; font-size: 0.95rem; margin-bottom: 30px; }
    .order-box { background: #1c2145; border: 2px solid #2e3460; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
    .order-row:last-child { border-bottom: none; }
    .order-row .label { color: #b0b3d0; }
    .order-row .value { font-weight: 700; color: #00c853; }
    .section-title { font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #2e3460; }
    .guide-section { background: #1c2145; border: 2px solid #2e3460; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .guide-header { background: rgba(0,200,83,0.08); padding: 15px 20px; border-bottom: 2px solid #2e3460; }
    .guide-header h3 { margin: 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .guide-body { padding: 20px; }
    .step { display: flex; gap: 12px; margin-bottom: 14px; }
    .step-num { width: 30px; height: 30px; min-width: 30px; border-radius: 50%; background: #7b2fbe; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
    .step-text { font-size: 0.88rem; color: #b0b3d0; line-height: 1.5; padding-top: 4px; }
    .step-text strong { color: #fff; }
    .step-text .hl { color: #ffd600; font-weight: 600; }
    .download-box { background: #0a0d20; border: 2px solid #00c853; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
    .download-box .dl-label { font-size: 0.8rem; color: #b0b3d0; margin-bottom: 6px; }
    .download-box .dl-label strong { color: #00c853; }
    .download-link { font-size: 0.7rem; color: #b0b3d0; word-break: break-all; background: rgba(0,200,83,0.08); padding: 10px; border-radius: 6px; display: block; margin-top: 8px; font-family: monospace; text-decoration: none; border: 1px solid #2e3460; }
    .tip-box { background: rgba(255,109,0,0.08); border: 1px solid rgba(255,109,0,0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; font-size: 0.85rem; color: #b0b3d0; }
    .support-box { background: rgba(123,47,190,0.1); border: 1px solid rgba(123,47,190,0.3); border-radius: 10px; padding: 18px 22px; text-align: center; margin-top: 25px; }
    .support-box p { margin: 0 0 12px; color: #b0b3d0; font-size: 0.9rem; }
    .support-btn { display: inline-block; background: #00c853; color: #000; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }
    .footer { background: #151938; border-top: 3px solid #7b2fbe; padding: 25px 30px; text-align: center; }
    .footer p { color: #b0b3d0; font-size: 0.8rem; margin: 5px 0; }
    .footer .logo-sm { font-size: 1rem; font-weight: 800; }
    .footer .logo-sm span { color: #00c853; }
    .divider { height: 3px; background: linear-gradient(90deg, transparent, #7b2fbe, #00c853, #00b0ff, #ff6d00, transparent); margin: 0 auto; max-width: 300px; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">&#9889; TiendApp <span>Chile</span></div>
      <div class="badge">Pago Confirmado</div>
    </div>

    <div class="content">
      <div class="success-icon">
        <div class="circle">&#10003;</div>
      </div>

      <h1>EmulaPlays esta listo</h1>
      <p class="subtitle">Tu compra fue procesada exitosamente. Aqui tienes tu guia de instalacion.</p>

      <div class="order-box">
        <div class="order-row">
          <span class="label">Producto</span>
          <span class="value">Sistema Light Retro</span>
        </div>
        <div class="order-row">
          <span class="label">Monto pagado</span>
          <span class="value">$${amount ? amount.toLocaleString("es-CL") : "10.000"} CLP</span>
        </div>
        <div class="order-row">
          <span class="label">ID de compra</span>
          <span class="value">#${paymentId}</span>
        </div>
        <div class="order-row">
          <span class="label">Fecha</span>
          <span class="value">${date}</span>
        </div>
      </div>

      <div class="divider" style="margin-bottom: 25px;"></div>

      <h2 class="section-title">Guia de Instalacion</h2>

      <div class="guide-section">
        <div class="guide-header">
          <h3>&#127918; Edicion Basica - PC (Sistema Light 50GB)</h3>
        </div>
        <div class="guide-body">
          <div class="download-box">
            <div class="dl-label"><strong>&#128229; Link de Descarga:</strong> Copia y pega en tu navegador</div>
            <a class="download-link" href="https://bucket-cf-weur-a.uploadnow.io/LmuSBXZ9jFXuYhKmoTQUJyNhTpk1/3591a86c-fd57-43e0-b675-41a4ffd89e7b?download-verify=1786985307-tYdVuRApzC0VWQudCI1sVowSFUPiejwTxqcqfgdrtdg%3D&amp;response-content-disposition=attachment%3B+filename%3D%22EmulaPlays+-+Edicion+Basica.zip%22">Descargar Edicion Basica</a>
          </div>
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Descarga el archivo ZIP</strong> y guardalo en un lugar facil de encontrar.</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">Verifica que tengas al menos <span class="hl">120 GB libres</span> en tu disco.</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">Clic derecho sobre el archivo &rarr; <span class="hl">"Extraer todo"</span>. Ruta recomendada: <strong>C:\\EmulaPlays</strong></div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-text">Abre la carpeta <strong>GPBOXPC</strong> y ejecuta el archivo <span class="hl">.exe</span> principal.</div>
          </div>
          <div class="step">
            <div class="step-num">5</div>
            <div class="step-text">Conecta tu control por USB o Bluetooth. Ve a <span class="hl">Configuracion &rarr; Controles</span> para mapear botones.</div>
          </div>
        </div>
      </div>

      <div class="guide-section">
        <div class="guide-header" style="background: rgba(0,200,83,0.08);">
          <h3>&#127942; Edicion Definitiva - PC (Sistema Full 380GB)</h3>
        </div>
        <div class="guide-body">
          <div class="download-box" style="border-color: #7b2fbe;">
            <div class="dl-label"><strong style="color: #7b2fbe;">&#128229; Link de Descarga:</strong> Copia y pega en tu navegador</div>
            <a class="download-link" href="https://bucket-cf-weur-a.uploadnow.io/LmuSBXZ9jFXuYhKmoTQUJyNhTpk1/528c5129-ae2d-4aa4-a05a-7cef73a0471b?download-verify=1786985341-AF%2BKShT6V%2Fmg8%2FxH5oAgoEoCX%2BCNGjlrvrtGg7elRms%3D&amp;response-content-disposition=attachment%3B+filename%3D%22EmulaPlays+-+Definitive+Edition.rar%22">Descargar Edicion Definitiva</a>
          </div>
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Descarga el archivo RAR</strong>. Es pesado (~71 GB), ten paciencia.</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">Instala <span class="hl">7-Zip</span> (gratis en 7-zip.org) o <strong>WinRAR</strong> para descomprimir.</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">Necesitas al menos <span class="hl">700 GB libres</span> para descomprimir.</div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-text">Clic derecho &rarr; <span class="hl">"Extraer aqui"</span>. Ruta: <strong>C:\\EmulaPlays\\GPBOXPC</strong></div>
          </div>
          <div class="step">
            <div class="step-num">5</div>
            <div class="step-text">La extraccion puede tardar <strong>30+ minutos</strong>. No cierres la ventana.</div>
          </div>
          <div class="step">
            <div class="step-num">6</div>
            <div class="step-text">Ejecuta el archivo <span class="hl">.exe</span> principal y configura tus controles.</div>
          </div>
        </div>
      </div>

      <div class="tip-box">
        <strong>&#9888;&#65039; Importante:</strong> Si tu antivirus bloquea archivos, agrega la carpeta de EmulaPlays a las excepciones. Si tienes problemas, contactanos por WhatsApp.
      </div>

      <div class="support-box">
        <p>&#128172; &iquest;Necesitas ayuda con la instalacion?</p>
        <a href="https://wa.me/56976739157?text=Necesito%20ayuda%20con%20EmulaPlays%20-%20Compra%20%23${paymentId}" class="support-btn">WhatsApp Soporte</a>
      </div>
    </div>

    <div class="footer">
      <div class="logo-sm">&#9889; TiendApp <span>Chile</span></div>
      <p>&copy; 2026 Todos los derechos reservados.</p>
      <p>Gracias por tu compra. &iexcl;A jugar!</p>
    </div>
  </div>
</body>
</html>`;
}
