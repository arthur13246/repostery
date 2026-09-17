import { getProducts, saveProducts } from '../../../lib/store';
import { checkAdminToken } from '../../../lib/auth';

export async function GET() {
  const products = await getProducts();
  return Response.json({ products });
}

export async function POST(request) {
  if (!checkAdminToken(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }
  if (!data.title || !data.price || !Array.isArray(data.variants) || data.variants.length === 0) {
    return Response.json({ error: 'Champs obligatoires manquants (titre, prix, au moins une variante).' }, { status: 400 });
  }

  const products = await getProducts();
  const newProduct = {
    id: 'p-' + Date.now() + Math.random().toString(36).slice(2, 7),
    title: data.title,
    description: data.description || '',
    price: data.price,
    category: data.category || '',
    images: data.images || [],
    variants: data.variants,
  };
  products.push(newProduct);
  await saveProducts(products);
  return Response.json({ product: newProduct });
}
