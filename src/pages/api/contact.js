export const prerender = false;

import admin from "firebase-admin";
import nodemailer from "nodemailer";

const serviceAccount = {
  type: import.meta.env.FIREBASE_TYPE,
  project_id: import.meta.env.FIREBASE_PROJECT_ID,
  private_key_id: import.meta.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: import.meta.env.FIREBASE_CLIENT_EMAIL,
  client_id: import.meta.env.FIREBASE_CLIENT_ID,
  auth_uri: import.meta.env.FIREBASE_AUTH_URI,
  token_uri: import.meta.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: import.meta.env.FIREBASE_AUTH_PROVIDER,
  client_x509_cert_url: import.meta.env.FIREBASE_CLIENT_CERT_URL,
};

if (!globalThis._firebaseInitialized) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
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
