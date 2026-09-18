import Stripe from 'stripe';
import { getProducts, savePendingOrder } from '../../../lib/store';

function genOrderId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'STRIPE_SECRET_KEY manquant côté serveur.' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { cart, deliveryInfo } = body || {};
  if (!Array.isArray(cart) || cart.length === 0) {
    return Response.json({ error: 'Panier vide.' }, { status: 400 });
  }
  if (!deliveryInfo?.contactEmail) {
    return Response.json({ error: 'E-mail de contact manquant.' }, { status: 400 });
  }
  if (deliveryInfo.deliveryMethod === 'relay' && !deliveryInfo.deliveryDetails) {
    return Response.json({ error: 'Point relais manquant.' }, { status: 400 });
  }

  const products = await getProducts();
  const line_items = [];
  const orderItems = [];

  for (const c of cart) {
    const product = products.find((p) => p.id === c.productId);
    const variant = product?.variants?.find((v) => v.id === c.variantId);
    if (!product || !variant) {
      return Response.json({ error: 'Un des produits du panier n\'existe plus.' }, { status: 400 });
    }
    if (variant.stock < c.quantity) {
      return Response.json({ error: `Stock insuffisant pour ${product.title} (${variant.size} / ${variant.color}).` }, { status: 400 });
    }
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: { name: `${product.title} — ${variant.size} / ${variant.color}` },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: c.quantity,
    });
    orderItems.push({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      size: variant.size,
      color: variant.color,
      price: product.price,
      quantity: c.quantity,
    });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 80 ? 0 : 6.9;
  if (shipping > 0) {
    line_items.push({
      price_data: { currency: 'eur', product_data: { name: 'Livraison' }, unit_amount: Math.round(shipping * 100) },
      quantity: 1,
    });
  }

  const orderId = genOrderId();
  const pendingOrder = {
    id: orderId,
    items: orderItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    contactEmail: deliveryInfo.contactEmail,
    customerName: deliveryInfo.customerName || '',
    deliveryMethod: deliveryInfo.deliveryMethod,
    deliveryDetails: deliveryInfo.deliveryDetails,
    status: 'En attente de paiement',
    date: new Date().toISOString(),
  };
  await savePendingOrder(pendingOrder);

  const origin = request.headers.get('origin');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    customer_email: deliveryInfo.contactEmail,
    success_url: `${origin}/?paiement=succes&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?paiement=annule`,
    metadata: { orderId },
  });

  return Response.json({ url: session.url });
}
