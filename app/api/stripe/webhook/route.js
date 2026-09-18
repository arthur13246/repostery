import Stripe from 'stripe';
import { getPendingOrder, deletePendingOrder, addOrder, getProducts, saveProducts } from '../../../../lib/store';

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Configuration Stripe manquante côté serveur.' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return Response.json({ error: `Signature invalide : ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const pending = await getPendingOrder(orderId);
      if (pending) {
        await addOrder({
          ...pending,
          status: 'Payée',
          stripeSessionId: session.id,
          paidAt: new Date().toISOString(),
        });
        await deletePendingOrder(orderId);

        const products = await getProducts();
        const updated = products.map((p) => ({
          ...p,
          variants: (p.variants || []).map((v) => {
            const item = pending.items.find((i) => i.productId === p.id && i.variantId === v.id);
            return item ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v;
          }),
        }));
        await saveProducts(updated);
      }
    }
  }

  return Response.json({ received: true });
}
