import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

let transporter = null;

if (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export const enviarCodigoEmail = async (correo, codigo) => {
  if (!transporter || !process.env.FROM_EMAIL) {
    console.log(`Código 2FA para ${correo}: ${codigo}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: correo,
      subject: "Código de verificación BioPulse",
      text: `Tu código de verificación es: ${codigo}`,
      html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p>`
    });
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
  }
};

