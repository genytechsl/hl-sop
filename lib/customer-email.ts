type CustomerTicketEmailProps = {
  customerName: string;
  ticketNumber: string;
  category: string;
  title: string;
  actionOwnerName: string;
};

export function customerTicketCreatedEmail({
  customerName,
  ticketNumber,
  category,
  title,
  actionOwnerName,
}: CustomerTicketEmailProps) {
  return `
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
                   width="800"
                   cellspacing="0"
                   cellpadding="0"
                   border="0"
                   style="
                       width: 100%;
                       max-width: 800px;
                       background-color: #ffffff;
                       border: 1px solid #d8e2f0;
                       border-radius: 10px;
                       overflow: hidden;
                   ">

                <tr>
                    <td style="padding: 14px 20px 12px 20px;">

                        <!-- Logo -->
                        

                        <!-- Message -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 14px;">
                            <tr>
                                <td style="
                                    font-size: 15px;
                                    line-height: 1.45;
                                    color: #111827;
                                ">
                                    <strong>Dear ${customerName},</strong>

                                    <div style="height: 6px;"></div>

                                    Thank you for reaching out to Home Lands Group.<br>
                                    We have received your concern and a ticket has been raised successfully.<br>
                                    Our team is already working on it.
                                </td>
                            </tr>
                        </table>

                        <!-- Ticket Information Box -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="
                                   margin-top: 12px;
                                   max-width: 510px;
                                   background-color: #f8faff;
                                   border: 1px solid #cbdcf4;
                                   border-radius: 8px;
                               ">
                            <tr>
                                <td style="padding: 10px 12px;">

                                    <table role="presentation"
                                           width="100%"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0">

                                        <!-- Ticket ID -->
                                        <tr>
                                            <td width="35"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px 5px 0;
                                                    font-size: 20px;
                                                    color: #1457e6;
                                                ">
                                                🎫
                                            </td>

                                            <td width="120"
                                                valign="middle"
                                                style="
                                                    padding: 5px 8px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                    white-space: nowrap;
                                                ">
                                                Ticket Number
                                            </td>

                                            <td width="18"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                ">
                                                :
                                            </td>

                                            <td valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                    color: #173b73;
                                                ">
                                                ${ticketNumber}
                                            </td>
                                        </tr>

                                        <!-- Category -->
                                        <tr>
                                            <td width="35"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px 5px 0;
                                                    font-size: 20px;
                                                    color: #1457e6;
                                                ">
                                                📁
                                            </td>

                                            <td width="120"
                                                valign="middle"
                                                style="
                                                    padding: 5px 8px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                    white-space: nowrap;
                                                ">
                                                Category Level
                                            </td>

                                            <td width="18"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                ">
                                                :
                                            </td>

                                            <td valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    color: #111827;
                                                ">
                                                ${category}
                                            </td>
                                        </tr>

                                        <!-- Assigned To -->
                                        <tr>
                                            <td width="35"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px 5px 0;
                                                    font-size: 20px;
                                                    color: #1457e6;
                                                ">
                                                👤
                                            </td>

                                            <td width="120"
                                                valign="middle"
                                                style="
                                                    padding: 5px 8px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                    white-space: nowrap;
                                                ">
                                                Assigned To
                                            </td>

                                            <td width="18"
                                                valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    font-weight: bold;
                                                ">
                                                :
                                            </td>

                                            <td valign="middle"
                                                style="
                                                    padding: 5px 4px;
                                                    font-size: 14px;
                                                    color: #111827;
                                                ">
                                                ${actionOwnerName}
                                            </td>
                                        </tr>

                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- Follow-up Message -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 8px;">
                            <tr>
                                <td style="
                                    font-size: 15px;
                                    line-height: 1.45;
                                    color: #111827;
                                ">
                                    We will keep you updated on the progress.<br>
                                    Thank you for your patience and trust in us.
                                </td>
                            </tr>
                        </table>

                        <!-- Divider -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 8px;">
                            <tr>
                                <td style="
                                    height: 1px;
                                    background-color: #d4dde9;
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
                               style="margin-top: 9px;">
                            <tr>
                                <td style="
                                    font-size: 14px;
                                    line-height: 1.4;
                                    color: #111827;
                                ">
                                    Regards,<br>
                                    Customer Management Unit (CMU)<br>
                                    Home Lands Group
                                </td>
                            </tr>
                        </table>

                        <!-- Contact Information -->
                        <table role="presentation"
                               width="100%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="margin-top: 8px;">
                            <tr>
                                <td style="
                                    font-size: 13px;
                                    line-height: 1.5;
                                    color: #1f2937;
                                ">
                                    <span style="color: #173b73;">☎</span>
                                    <a href="tel:+94112786786"
                                       style="
                                           color: #1f2937;
                                           text-decoration: none;
                                       ">
                                        +94 11 2 786 786
                                    </a>

                                    <span style="
                                        display: inline-block;
                                        margin: 0 9px;
                                        color: #c4cbd5;
                                    ">|</span>

                                    <span style="color: #173b73;">✉</span>
                                    <a href="mailto:care@homelandsskyline.lk"
                                       style="
                                           color: #1f2937;
                                           text-decoration: none;
                                       ">
                                        care@homelandsskyline.lk
                                    </a>

                                    <span style="
                                        display: inline-block;
                                        margin: 0 9px;
                                        color: #c4cbd5;
                                    ">|</span>

                                    <span style="color: #173b73;">🌐</span>
                                    <a href="https://www.homelandsskyline.lk/"
                                       style="
                                           color: #1f2937;
                                           text-decoration: none;
                                       ">
                                        www.homelandsskyline.lk
                                    </a>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>
  `;
}

export function customerTicketResolvedEmail({
  customerName,
  ticketNumber,
}: {
  customerName: string;
  ticketNumber: string;
}) {
  return `
<table role="presentation"
       width="100%"
       cellspacing="0"
       cellpadding="0"
       border="0"
       style="background-color:#f4f6f8;">
<tr>
<td align="center">

<table role="presentation"
       width="800"
       cellspacing="0"
       cellpadding="0"
       border="0"
       style="
          width:100%;
          max-width:800px;
          background-color:#ffffff;
          border:1px solid #d8e2f0;
          border-radius:10px;
          overflow:hidden;
       ">

<tr>
<td style="padding:14px 20px 12px 20px;">

<table width="100%">
<tr>
<td style="
font-size:15px;
line-height:1.45;
color:#111827;
">

<strong>Dear ${customerName},</strong>

<div style="height:6px;"></div>

We are pleased to inform you that your reported concern has been successfully resolved and the ticket has been closed.

</td>
</tr>
</table>

<table width="100%"
       cellspacing="0"
       cellpadding="0"
       border="0"
       style="
          margin-top:12px;
          max-width:510px;
          background-color:#f8faff;
          border:1px solid #cbdcf4;
          border-radius:8px;
       ">

<tr>
<td style="padding:10px 12px;">

<table width="100%">

<tr>
<td width="35"
style="
padding:5px 4px 5px 0;
font-size:20px;
">
🎫
</td>

<td width="120"
style="
padding:5px 8px;
font-size:14px;
font-weight:bold;
white-space:nowrap;
">
Ticket Number
</td>

<td style="
font-size:14px;
font-weight:bold;
color:#173b73;
">
${ticketNumber}
</td>

</tr>

<tr>
<td width="35"
style="
padding:5px 4px 5px 0;
font-size:20px;
">
✅
</td>

<td width="120"
style="
padding:5px 8px;
font-size:14px;
font-weight:bold;
white-space:nowrap;
">
Status
</td>

<td style="
font-size:14px;
font-weight:bold;
color:#15803d;
">
RESOLVED & CLOSED
</td>

</tr>

</table>

</td>
</tr>

</table>

<table width="100%" style="margin-top:10px;">
<tr>
<td style="
font-size:15px;
line-height:1.45;
color:#111827;
">

Thank you for your patience and cooperation throughout this process.

<br><br>

Should you require any further assistance, please feel free to contact our Customer Management Unit.

</td>
</tr>
</table>

<table width="100%" style="margin-top:10px;">
<tr>
<td style="
height:1px;
background-color:#d4dde9;
font-size:0;
">
&nbsp;
</td>
</tr>
</table>

<table width="100%" style="margin-top:9px;">
<tr>
<td style="
font-size:14px;
line-height:1.4;
color:#111827;
">

Regards,<br>
Customer Management Unit (CMU)<br>
Home Lands Group

</td>
</tr>
</table>

<table width="100%" style="margin-top:8px;">
<tr>
<td style="
font-size:13px;
line-height:1.5;
color:#1f2937;
">

<span style="color:#173b73;">☎</span>
<a href="tel:+94112786786"
style="color:#1f2937;text-decoration:none;">
+94 11 2 786 786
</a>

<span style="margin:0 9px;color:#c4cbd5;">|</span>

<span style="color:#173b73;">✉</span>
<a href="mailto:care@homelandsskyline.lk"
style="color:#1f2937;text-decoration:none;">
care@homelandsskyline.lk
</a>

<span style="margin:0 9px;color:#c4cbd5;">|</span>

<span style="color:#173b73;">🌐</span>
<a href="https://www.homelandsskyline.lk/"
style="color:#1f2937;text-decoration:none;">
www.homelandsskyline.lk
</a>

</td>
</tr>
</table>

</td>
</tr>

</table>

</td>
</tr>
</table>
`;
}
