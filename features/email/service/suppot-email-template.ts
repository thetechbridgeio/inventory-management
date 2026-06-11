interface SupportEmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const escapeHtml = (str: string) =>
  str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const supportEmailTemplate = ({
  name,
  email,
  subject,
  message,
}: SupportEmailTemplateProps) => {
  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<style>
  body {
    margin: 0;
    padding: 24px;
    background: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }

  .header {
    padding: 28px 32px;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: white;
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  .header p {
    margin: 8px 0 0;
    opacity: 0.9;
    font-size: 14px;
  }

  .content {
    padding: 32px;
  }

  .grid {
    display: table;
    width: 100%;
    border-collapse: collapse;
  }

  .row {
    display: table-row;
  }

  .label,
  .value {
    display: table-cell;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
  }

  .label {
    width: 140px;
    font-weight: 600;
    color: #6b7280;
  }

  .value {
    color: #111827;
  }

  .message-box {
    margin-top: 24px;
    padding: 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .footer {
    padding: 24px 32px;
    border-top: 1px solid #e5e7eb;
    font-size: 13px;
    color: #6b7280;
    background: #fafafa;
  }

  .email-link {
    color: #2563eb;
    text-decoration: none;
  }
</style>
</head>

<body>
  <div class="container">

    <div class="header">
      <h1>📩 New Support Request</h1>
      <p>Submitted on ${submittedAt}</p>
    </div>

    <div class="content">

      <div class="grid">

        <div class="row">
          <div class="label">Name</div>
          <div class="value">${escapeHtml(name)}</div>
        </div>

        <div class="row">
          <div class="label">Email</div>
          <div class="value">
            <a class="email-link" href="mailto:${escapeHtml(email)}">
              ${escapeHtml(email)}
            </a>
          </div>
        </div>

        <div class="row">
          <div class="label">Subject</div>
          <div class="value">${escapeHtml(subject)}</div>
        </div>

      </div>

      <h3 style="margin-top:32px;margin-bottom:12px;">
        Message
      </h3>

      <div class="message-box">
${escapeHtml(message)}
      </div>

    </div>

    <div class="footer">
      This support request was submitted through the application contact form.
      Reply directly to this email to respond to the customer.
    </div>

  </div>
</body>
</html>
`;
};