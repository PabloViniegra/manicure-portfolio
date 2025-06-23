export const prerender = false;

import admin from "firebase-admin";
import nodemailer from "nodemailer";
import serviceAccount from "../../../service-account.json";

if (!globalThis._firebaseInitialized) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });
  globalThis._firebaseInitialized = true;
}

const db = admin.firestore();

export async function POST({ request }) {
  const data = await request.json();

  const { name, email, message } = data;

  await db.collection("contacts").add({
    name,
    email,
    message,
    createdAt: new Date(),
  });

  const { BREVO_HOST, BREVO_PORT, BREVO_USER, BREVO_PASS, EMAIL_TO } =
    import.meta.env;

  const transporter = nodemailer.createTransport({
    host: BREVO_HOST,
    port: Number(BREVO_PORT),
    auth: {
      user: BREVO_USER,
      pass: BREVO_PASS,
    },
  });

  const mailOptions = {
    from: `"Stiletto Nailz" <${BREVO_USER}>`,
    to: EMAIL_TO,
    subject: `Nuevo mensaje de contacto de ${name}`,
    html: `
      <h1>Nuevo mensaje de contacto</h1>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong> ${message}</p>
    `,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(
      JSON.stringify({ message: "Correo electrónico enviado correctamente" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error al enviar el correo electrónico",
        details: err.message,
      }),
      { status: 500 }
    );
  }
}
