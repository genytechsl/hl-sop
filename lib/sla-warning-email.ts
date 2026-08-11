type SlaWarningEmailProps = {
  ticketNumber: string;
  employeeName: string;
};

export function slaWarningEmail({
  ticketNumber,
  employeeName,
}: SlaWarningEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SLA Warning</title>
</head>

<body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center">

      <table
        role="presentation"
        width="600"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;"
      >

        <!-- Header -->
        <tr>
          <td style="background:#b91c1c;padding:18px 24px;">
            <h2 style="margin:0;color:#ffffff;font-size:22px;">
              ⚠️ SLA Warning Notification
            </h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px;">

            <p style="margin:0;font-size:14px;line-height:1.6;">
              Dear <strong>${employeeName},</strong>
            </p>

            <p style="margin:18px 0 24px;font-size:14px;line-height:1.7;">
              The following ticket has reached
              <strong style="color:#dc2626;">80% of its Service Level Agreement (SLA)</strong>.
              Please review and take the necessary action before the SLA is breached.
            </p>

            <!-- Ticket Information -->
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="8"
              border="0"
              style="border-collapse:collapse;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;"
            >

              <tr>
                <td width="180" style="font-weight:bold;">Ticket Number</td>
                <td>${ticketNumber}</td>
              </tr>

              <tr>
                <td style="font-weight:bold;">Customer</td>
                <td>Shanika Wijesinghe</td>
              </tr>

              <tr>
                <td style="font-weight:bold;">Priority</td>
                <td>
                  <span style="color:#dc2626;font-weight:bold;">
                    VERY HIGH
                  </span>
                </td>
              </tr>

              <tr>
                <td style="font-weight:bold;">Current Status</td>
                <td>OPEN</td>
              </tr>

              <tr>
                <td style="font-weight:bold;">Remaining SLA Time</td>
                <td>
                  <span style="color:#d97706;font-weight:bold;">
                    4h 48m
                  </span>
                </td>
              </tr>

            </table>

            <!-- Alert -->
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="margin-top:24px;"
            >
              <tr>
                <td
                  style="
                    background:#fef2f2;
                    border-left:5px solid #dc2626;
                    padding:16px;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  Please log in to the
                  <strong>Customer Inquiry Management Platform</strong>
                  and update this ticket as soon as possible to prevent an SLA breach.
                </td>
              </tr>
            </table>

            <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />

            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
              Regards,<br>
              <strong>Customer Management Unit (CMU)</strong><br>
              Home Lands Group
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
}
