export function renderVerifyEmailString(verificationUrl: string, username = "", userEmail = "") {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Verify your email — AI chatbot</title>
  </head>
  <body style="margin:0;padding:20px;background:#fafafa;color:#333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#fafafa;border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;margin:0 auto;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-collapse:collapse;">
            <!-- Header -->
            <tr>
              <td style="padding:48px 40px 32px;text-align:center;background:#ffffff;border-radius:12px 12px 0 0;">
                <div style="color:#6366f1;font-size:16px;font-weight:600;margin-bottom:32px;letter-spacing:0.5px;">AI CHATBOT</div>
                <div style="text-align:center;margin-bottom:24px;">
                  <div style="width:48px;height:48px;background:#f0f9ff;border:1px solid #e0f2fe;border-radius:8px;display:inline-block;text-align:center;line-height:48px;">
                    <span style="font-size:20px;color:#0ea5e9;">✉</span>
                  </div>
                </div>
                <h1 style="font-size:28px;font-weight:700;color:#111827;margin:0 0 12px;line-height:1.2;">Verify your email${username ? `, ${username}` : ""}</h1>
                <p style="font-size:16px;color:#6b7280;margin:0;line-height:1.5;font-weight:400;">We've sent a verification link to your email address. Click the button below to verify and activate your account.</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding:0 40px 40px;">
                ${
                  userEmail
                    ? `
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:32px 0;border-collapse:collapse;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td style="width:20px;vertical-align:middle;padding-right:12px;">
                            <span style="font-size:16px;color:#6366f1;">@</span>
                          </td>
                          <td style="vertical-align:middle;font-size:15px;color:#374151;font-weight:500;">${userEmail}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }
                
                <a href="${verificationUrl}" target="_blank" rel="noopener" style="display:block;width:100%;background:#6366f1;color:#ffffff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:8px;font-weight:600;font-size:16px;margin:32px 0;box-sizing:border-box;">
                  Verify Email Address
                </a>
                
                <div style="margin:40px 0;text-align:center;">
                  <div style="height:1px;background:#e5e7eb;margin-bottom:16px;"></div>
                  <div style="color:#9ca3af;font-size:14px;font-weight:500;">Having trouble?</div>
                </div>
                
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;box-sizing:border-box;border-collapse:collapse;">
                  <tr>
                    <td style="padding:24px;">
                      <h3 style="font-size:16px;font-weight:600;color:#374151;margin:0 0 8px;line-height:1.4;">Button not working?</h3>
                      <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">Copy the verification link and paste it into your browser manually.</p>
                      
                      <div style="margin-bottom:8px;">
                        <label style="font-size:13px;color:#6b7280;font-weight:500;">Verification URL</label>
                      </div>
                      
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td style="background:#ffffff;border:1px solid #d1d5db;border-radius:6px;padding:12px 16px;vertical-align:middle;">
                            <div style="font-size:13px;color:#374151;line-height:1.4;overflow-wrap:break-word;word-break:break-word;font-family:'SF Mono',Monaco,'Cascadia Code','Roboto Mono',Courier,monospace;">${verificationUrl}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding:24px 40px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
                <p style="font-size:14px;color:#6b7280;margin:0;line-height:1.5;">If you didn't create an account, you can safely ignore this message.<br>This verification link will expire in 24 hours.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Brand Footer -->
      <tr>
        <td style="padding:32px;text-align:center;background:transparent;">
          <div style="font-size:14px;font-weight:500;color:#9ca3af;">AI chatbot</div>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}
