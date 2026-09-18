import Stripe from 'stripe';
import { getOrders } from '../../../../../lib/store';

export async function GET(request, { params }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'STRIPE_SECRET_KEY manquant côté serveur.' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(params.sessionId);
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return Response.json({ order: null, status: 'unknown' });
    }
    const orders = await getOrders();
    const order = orders.find((o) => o.id === orderId) || null;
    if (!order) {
      return Response.json({ order: null, status: 'processing' });
    }
    return Response.json({ order, status: 'paid' });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
