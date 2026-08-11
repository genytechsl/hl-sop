type UserRegistrationEmailProps = {
  username: string;
  role: string;
};

export function userRegistrationEmail({
  username,
  role,
}: UserRegistrationEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>User Registration</title>
</head>

<body style="
    margin:0;
    padding:20px;
    background-color:#f4f6f8;
    font-family:Arial, Helvetica, sans-serif;
    color:#111827;
">

<table role="presentation"
       width="100%"
       cellspacing="0"
       cellpadding="0"
       border="0">
<tr>
<td align="center">

<table role="presentation"
       width="100%"
       cellspacing="0"
       cellpadding="0"
       border="0"
       style="
          max-width:600px;
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:10px;
          overflow:hidden;
       ">

<tr>
<td style="padding:25px;">

<!-- Header -->
<table width="100%">
<tr>
<td align="center">
    <h2 style="
        margin:0;
        color:#1e40af;
        font-size:22px;
    ">
        Customer Inquiry Management Platform
    </h2>

    <p style="
        margin-top:8px;
        color:#64748b;
        font-size:14px;
    ">
        User Registration Confirmation
    </p>
</td>
</tr>
</table>


<!-- Greeting -->
<table width="100%" style="margin-top:25px;">
<tr>
<td style="
    font-size:14px;
    line-height:1.6;
">



<br><br>

Your user account has been successfully created in the 
<strong>SolvY360 Customer Inquiry Platform</strong>.

You can now access the system using the credentials provided during registration.

</td>
</tr>
</table>


<!-- User Details -->
<table width="100%"
       cellspacing="0"
       cellpadding="0"
       style="
          margin-top:20px;
          border-collapse:collapse;
          background:#f8fafc;
          border-radius:8px;
       ">

<tr>
<td style="
    padding:12px;
    font-size:13px;
    font-weight:bold;
">
Username
</td>

<td style="
    padding:12px;
    font-size:13px;
">
${username}
</td>
</tr>





<tr>
<td style="
    padding:12px;
    font-size:13px;
    font-weight:bold;
">
System Role
</td>

<td style="
    padding:12px;
    font-size:13px;
">
${role}
</td>
</tr>

</table>


<!-- Login Message -->
<table width="100%" style="margin-top:20px;">
<tr>
<td style="
    font-size:13px;
    line-height:1.6;
">

Please log in to the 
<a href="http://localhost:3000/"
   style="
      color:#2563eb;
      text-decoration:none;
      font-weight:bold;
   ">
Customer Inquiry Management Platform
</a>

to access your account.

<br><br>

For security reasons, please do not share your login credentials with anyone.

</td>
</tr>
</table>


<!-- Divider -->
<table width="100%" style="margin-top:20px;">
<tr>
<td style="
    height:1px;
    background:#e5e7eb;
">
</td>
</tr>
</table>


<!-- Footer -->
<table width="100%" style="margin-top:15px;">
<tr>
<td style="
    font-size:13px;
    line-height:1.5;
">

Regards,<br>
<strong>Customer Management Unit (CMU)</strong><br>
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
