type ActionOwnerTicketEmailProps = {
  customerName: string;
  ticketNumber: string;
  category: string;
  title: string;
  actionOwnerName: string;
  scope: string;
  complaintSource: string;
  description: string;
  property: string;
  slaTarget: string;
};

export function actionOwnerTicketCreatedEmail({
  customerName,
  ticketNumber,
  category,
  title,
  actionOwnerName,
  property,
  description,
  complaintSource,
  scope,
  slaTarget,
}: ActionOwnerTicketEmailProps) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New CIM Ticket Assignment</title>
</head>

<body style="
    margin: 0;
    padding: 20px;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
">

<table role="presentation"
       width="100%"
       cellspacing="0"
       cellpadding="0"
       border="0"
       style="background-color: #f4f6f8;">
    <tr>
        <td align="center">

            <!-- Main Email Container -->
            <table role="presentation"
                   width="820"
                   cellspacing="0"
                   cellpadding="0"
                   border="0"
                   style="
                       width: 100%;
                       max-width: 820px;
                       background-color: #ffffff;
                       border: 1px solid #eadfd8;
                       border-radius: 10px;
                       overflow: hidden;
                   ">

                <tr>
                    <td style="padding: 12px 24px;">

                        <!-- Greeting -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0">
                            <tr>
                                <td style="
                                    font-size: 14px;
                                    line-height: 1.45;
                                    color: #111827;
                                ">
                                    <strong>Dear ${actionOwnerName},</strong><br>
                                    You have been assigned a new ticket. Please find the details below.
                                </td>
                            </tr>
                        </table>

                        <!-- Ticket Details -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 6px;">
                            <tr>

                                <!-- Left Column -->
                                <td width="50%"
                                    valign="top"
                                    style="
                                        width: 50%;
                                        padding-right: 26px;
                                        border-right: 1px solid #e4d8d2;
                                    ">

                                    <table role="presentation"
                                           width="100%"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0">

                                        <tr>
                                            <td width="115" style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Ticket Number
                                            </td>
                                            <td width="18" style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${ticketNumber}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Category Level
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${category}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Scope / Type
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${scope}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Subject
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${title}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Complaint Source
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${complaintSource}
                                            </td>
                                        </tr>

                                        

                                    </table>
                                </td>

                                <!-- Right Column -->
                                <td width="50%"
                                    valign="top"
                                    style="
                                        width: 50%;
                                        padding-left: 26px;
                                    ">

                                    <table role="presentation"
                                           width="100%"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0">

                                        <tr>
                                            <td width="110" style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Customer Name
                                            </td>
                                            <td width="18" style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${customerName}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Unit No.
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                A/12-05
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                Project / Property
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${property}
                                            </td>
                                        </tr>

                                        

                                        <tr>
                                            <td style="padding: 2px 0; font-size: 13px; font-weight: bold;">
                                                SLA Target
                                            </td>
                                            <td style="padding: 2px 8px; font-size: 13px;">:</td>
                                            <td style="padding: 2px 0; font-size: 13px;">
                                                ${slaTarget}
                                            </td>
                                        </tr>

                                        

                                    </table>
                                </td>

                            </tr>
                        </table>

                        <!-- Divider -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 7px;">
                            <tr>
                                <td style="
                                    height: 1px;
                                    background-color: #e5e7eb;
                                    font-size: 0;
                                    line-height: 0;
                                ">
                                    &nbsp;
                                </td>
                            </tr>
                        </table>

                        <!-- Description -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 5px;">
                            <tr>
                                <td style="
                                    font-size: 13px;
                                    line-height: 1.35;
                                    color: #111827;
                                ">
                                    <strong>Description / Details:</strong><br>
                                    ${description}
                                </td>
                            </tr>
                        </table>

                        <!-- Attachments Heading -->
                        

                        <!-- Attachment Cards -->
                        

                        <!-- Action Message -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 8px;">
                            <tr>
                                <td style="
                                    font-size: 13px;
                                    line-height: 1.4;
                                    color: #111827;
                                ">
                                    Please log in to the <a href="https://cip.homelandsskyline.lk/" target="_blank"> CIP App </a> to update the status and take necessary action.
                                </td>
                            </tr>
                        </table>

                        <!-- Divider -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 5px;">
                            <tr>
                                <td style="
                                    height: 1px;
                                    background-color: #e5e7eb;
                                    font-size: 0;
                                    line-height: 0;
                                ">
                                    &nbsp;
                                </td>
                            </tr>
                        </table>

                        <!-- Signature -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 6px;">
                            <tr>
                                <td style="
                                    font-size: 13px;
                                    line-height: 1.4;
                                    color: #111827;
                                ">
                                    Regards,<br>
                                    Customer Management Unit (CMU)<br>
                                    Home Lands Group
                                </td>
                            </tr>
                        </table>

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
