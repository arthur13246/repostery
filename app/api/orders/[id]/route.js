import { updateOrderStatus } from '../../../../lib/store';
import { checkAdminToken } from '../../../../lib/auth';

export async function PATCH(request, { params }) {
  if (!checkAdminToken(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }
  if (!data.status) {
    return Response.json({ error: 'Statut manquant.' }, { status: 400 });
  }
  const order = await updateOrderStatus(params.id, data.status);
  if (!order) {
    return Response.json({ error: 'Commande introuvable.' }, { status: 404 });
  }
  return Response.json({ order });
}
