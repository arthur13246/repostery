import { getProducts, saveProducts } from '../../../../lib/store';
import { checkAdminToken } from '../../../../lib/auth';

export async function PUT(request, { params }) {
  if (!checkAdminToken(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }

  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === params.id);
  if (idx === -1) {
    return Response.json({ error: 'Produit introuvable.' }, { status: 404 });
  }
  products[idx] = { ...products[idx], ...data, id: products[idx].id };
  await saveProducts(products);
  return Response.json({ product: products[idx] });
}

export async function DELETE(request, { params }) {
  if (!checkAdminToken(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== params.id);
  await saveProducts(filtered);
  return Response.json({ ok: true });
}
