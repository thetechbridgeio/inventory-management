interface ForgotPasswordTemplateProps {
  name: string
  contactNumber: string
  companyName: string
}

export const forgotPasswordTemplate = ({
  name,
  contactNumber,
  companyName,
}: ForgotPasswordTemplateProps) => {
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
              #dc2626,
              #ef4444
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
          }

          .value {
            font-size: 15px;
            color: #111827;
            line-height: 1.7;
          }

          .alert {
            margin-top: 24px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 16px;
            border-radius: 12px;
            font-size: 14px;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>Password Reset Request</h1>
          </div>

          <div class="content">

            <div class="field">
              <span class="label">
                Full Name
              </span>

              <div class="value">
                ${name}
              </div>
            </div>

            <div class="field">
              <span class="label">
                Contact Number
              </span>

              <div class="value">
                ${contactNumber}
              </div>
            </div>

            <div class="field">
              <span class="label">
                Company Name
              </span>

              <div class="value">
                ${companyName}
              </div>
            </div>

            <div class="alert">
              This user has requested a password reset.
            </div>

          </div>
        </div>
      </body>
    </html>
  `
}
