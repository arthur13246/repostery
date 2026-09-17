import { getOrders } from '../../../../lib/store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();
  if (!email) {
    return Response.json({ orders: [] });
  }
  const orders = await getOrders();
  const mine = orders.filter((o) => (o.contactEmail || '').toLowerCase() === email);
  return Response.json({ orders: mine });
}
