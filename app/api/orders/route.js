import { getOrders } from '../../../lib/store';
import { checkAdminToken } from '../../../lib/auth';

export async function GET(request) {
  if (!checkAdminToken(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const orders = await getOrders();
  return Response.json({ orders });
}
