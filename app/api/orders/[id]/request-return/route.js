import { updateOrderStatus } from '../../../../../lib/store';

export async function POST(request, { params }) {
  const order = await updateOrderStatus(params.id, 'Retour demandé');
  if (!order) {
    return Response.json({ error: 'Commande introuvable.' }, { status: 404 });
  }
  return Response.json({ order });
}
