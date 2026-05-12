interface SupportEmailTemplateProps {
  name: string
  email: string
  subject: string
  message: string
}

export const supportEmailTemplate = ({
  name,
  email,
  subject,
  message,
}: SupportEmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            padding: 32px;
            color: #111827;
          }

          .container {
            max-width: 700px;
            margin: auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }

          .header {
            background: linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

            color: white;
            padding: 32px;
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .content {
            padding: 32px;
          }

          .field {
            margin-bottom: 24px;
          }

          .label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .value {
            font-size: 15px;
            color: #111827;
            line-height: 1.7;
          }

          .message-box {
            background: #f9fafb;
            border-radius: 12px;
            padding: 18px;
            white-space: pre-wrap;
          }

          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>New Support Request</h1>
          </div>

          <div class="content">

            <div class="field">
              <span class="label">
                Name
              </span>

              <div class="value">
                ${name}
              </div>
            </div>

            <div class="field">
              <span class="label">
                Email
              </span>

              <div class="value">
                ${email}
              </div>
            </div>

            <div class="field">
              <span class="label">
                Subject
              </span>

              <div class="value">
                ${subject}
              </div>
            </div>

            <div class="field">
              <span class="label">
                Message
              </span>

              <div class="message-box">
                ${message}
              </div>
            </div>

            <div class="footer">
              This message was submitted through
              the support contact form.
            </div>

          </div>
        </div>
      </body>
    </html>
  `
}
