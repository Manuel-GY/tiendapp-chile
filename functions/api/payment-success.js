const SUCCESS_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Exitoso - TiendApp Chile</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Space Grotesk', sans-serif; }
        body { background: #0e1128; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { max-width: 520px; width: 100%; padding: 30px; text-align: center; }
        .n64-logo { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 40px; }
        .n64-btn { width: 24px; height: 24px; border-radius: 50%; display: inline-block; }
        .n64-btn.b { background: #00b0ff; box-shadow: 0 0 12px #00b0ff; }
        .n64-btn.r { background: #00c853; box-shadow: 0 0 12px #00c853; }
        .n64-btn.a { background: #ffd600; box-shadow: 0 0 12px #ffd600; }
        .n64-btn.l { background: #7b2fbe; box-shadow: 0 0 12px #7b2fbe; }
        .n64-btn.z { background: #ff1744; box-shadow: 0 0 12px #ff1744; }
        .success-circle { width: 100px; height: 100px; border-radius: 50%; background: rgba(0,200,83,0.15); border: 4px solid #00c853; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 3rem; box-shadow: 0 0 40px rgba(0,200,83,0.3); }
        .pixel-font { font-family: 'Press Start 2P', monospace; }
        h1 { font-size: 1.8rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        h1 span { color: #00c853; }
        .subtitle { color: #b0b3d0; font-size: 1rem; line-height: 1.7; margin-bottom: 35px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .info-box { background: #1c2145; border: 2px solid #2e3460; border-radius: 12px; padding: 22px; margin-bottom: 30px; text-align: left; }
        .info-box p { font-size: 0.9rem; color: #b0b3d0; line-height: 1.6; margin-bottom: 10px; }
        .info-box p:last-child { margin-bottom: 0; }
        .info-box strong { color: #00c853; }
        .neon-divider { height: 3px; background: linear-gradient(90deg, transparent, #7b2fbe, #00c853, #00b0ff, #ff6d00, transparent); margin: 0 auto 30px; max-width: 300px; border-radius: 2px; box-shadow: 0 0 15px rgba(123,47,190,0.4); }
        .btn { display: inline-block; text-decoration: none; font-weight: 700; font-size: 0.95rem; padding: 14px 32px; border-radius: 8px; transition: all 0.2s; margin: 6px; }
        .btn-primary { background: #00c853; color: #000; }
        .btn-primary:hover { box-shadow: 0 0 25px rgba(0,200,83,0.5); transform: translateY(-2px); }
        .btn-outline { background: transparent; border: 2px solid #2e3460; color: #b0b3d0; }
        .btn-outline:hover { border-color: #7b2fbe; color: #fff; }
        .pixel-text { font-size: 0.65rem; color: #ffd600; letter-spacing: 3px; margin-top: 30px; animation: blink 1.2s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .footer { margin-top: 40px; font-size: 0.8rem; color: #b0b3d0; }
        .footer span { color: #00c853; font-weight: 800; }
    </style>
</head>
<body>
    <div class="container">
        <div class="n64-logo">
            <div class="n64-btn b"></div>
            <div class="n64-btn r"></div>
            <div class="n64-btn a"></div>
            <div class="n64-btn l"></div>
            <div class="n64-btn z"></div>
        </div>
        <div class="success-circle">&#10003;</div>
        <h1><span class="pixel-font" style="display:block; font-size:0.6rem; color:#ffd600; margin-bottom:15px; letter-spacing:4px;">Player 1 Ready</span>Pago <span>Exitoso</span></h1>
        <p class="subtitle">Tu compra fue procesada correctamente. Revisa tu correo electronico para recibir la guia de instalacion con tus links de descarga.</p>
        <div class="neon-divider"></div>
        <div class="info-box">
            <p><strong>&#128231; Correo electronico:</strong> Se envio la guia de instalacion al email que usaste para pagar.</p>
            <p><strong>&#9200; No lo ves?</strong> Revisa tu carpeta de spam o correo no deseado. Si no lo encuentras en 5 minutos, contactanos por WhatsApp.</p>
        </div>
        <a href="../retro/index.html" class="btn btn-primary">Volver a Retro Gaming</a>
        <a href="https://wa.me/56976739157?text=Necesito%20ayuda%20con%20mi%20compra%20EmulaPlays" class="btn btn-outline" target="_blank" rel="noopener noreferrer">&#128172; WhatsApp Soporte</a>
        <p class="pixel-text">INSERT COIN</p>
        <div class="footer">
            <p>&#9889; TiendApp <span>Chile</span></p>
            <p>&copy; 2026 Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;

export async function onRequestGet() {
  return new Response(SUCCESS_HTML, {
    status: 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
