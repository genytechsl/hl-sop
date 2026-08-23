import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USERNAME,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.verify();

console.log("From lib/mailer.ts, SMTP connection successful");

type SendEmailProps = {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: nodemailer.SendMailOptions["attachments"];
};

export async function sendEmail({
  to,
  subject,
  html,
  cc,
  bcc,
  attachments,
}: SendEmailProps) {
  const info = await transporter.sendMail({
    from: `"Customer Inquiry Platform" <${process.env.SMTP_FROM}>`,
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });

  return info;
}
