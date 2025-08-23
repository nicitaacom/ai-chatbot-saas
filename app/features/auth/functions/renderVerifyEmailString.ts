export function renderVerifyEmailString(verificationUrl: string, username = "") {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Verify your email — AI chatbot</title>
    <style>
      :root{--bg:#0b0b0b;--card:#0f1724;--accent:#7c3aed;--muted:#9ca3af}
      body{margin:0;padding:32px;background:var(--bg);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
      .wrap{max-width:680px;margin:0 auto;background:var(--card);padding:32px;border-radius:12px}
      .logo{font-weight:700;color:var(--accent);letter-spacing:0.4px;margin-bottom:18px}
      h1{margin:0 0 8px;font-size:20px}
      p{margin:0 0 18px;color:var(--muted);line-height:1.45}
      .btn{display:inline-block;padding:12px 20px;border-radius:8px;background:var(--accent);color:#fff;text-decoration:none;font-weight:600}
      .small{font-size:13px;color:var(--muted);margin-top:18px}
      .footer{font-size:12px;color:var(--muted);margin-top:28px}
      a.link{color:#9cc3ff}
    </style>
  </head>
  <body>
    <div class="wrap" role="article" aria-label="Verify your email">
      <div class="logo">AI chatbot</div>
      <h1>Verify your email${username ? `, ${username}` : ""}</h1>
      <p>Thanks for registering. Click the button below to verify your email and finish setting up your account.</p>
      <a class="btn" href="${verificationUrl}" target="_blank" rel="noopener">Verify your email</a>
      <div class="small">
        If the button doesn't work, copy & paste the link into your browser:
        <div style="word-break:break-all"><a class="link" href="${verificationUrl}">${verificationUrl}</a></div>
      </div>
      <div class="footer">If you didn't create an account, you can safely ignore this message.</div>
    </div>
  </body>
</html>
`
}
