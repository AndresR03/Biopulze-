import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const enviarCodigoSMS = async (telefono, codigo) => {
  // Si no hay credenciales configuradas, mostramos el código en consola
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`Código 2FA para ${telefono}: ${codigo}`);
    return;
  }

  try {
    await client.messages.create({
      body: `Tu código de verificación BioPulse es: ${codigo}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: telefono
    });
  } catch (error) {
    console.error("Error enviando SMS:", error);
    // No rompemos el flujo, solo registramos el fallo
  }
};

