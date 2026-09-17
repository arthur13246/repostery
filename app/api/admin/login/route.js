export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Requête invalide.' }, { status: 400 });
  }

  const { email, password } = body || {};
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminEmail || !adminPassword || !adminToken) {
    return Response.json(
      { ok: false, error: "Configuration manquante côté serveur (ADMIN_EMAIL, ADMIN_PASSWORD ou ADMIN_TOKEN)." },
      { status: 500 }
    );
  }

  if (
    typeof email === 'string' &&
    typeof password === 'string' &&
    email.toLowerCase() === adminEmail.toLowerCase() &&
    password === adminPassword
  ) {
    return Response.json({ ok: true, token: adminToken, name: 'Administrateur', email: adminEmail });
  }

  return Response.json({ ok: false, error: 'E-mail ou mot de passe incorrect.' }, { status: 401 });
}
