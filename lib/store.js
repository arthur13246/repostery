import { kv } from '@vercel/kv';

const PRODUCTS_KEY = 'arc:products';
const ORDERS_KEY = 'arc:orders';
const PENDING_PREFIX = 'arc:pending:';

export async function getProducts() {
  const products = await kv.get(PRODUCTS_KEY);
  return products || [];
}

export async function saveProducts(products) {
  await kv.set(PRODUCTS_KEY, products);
}

export async function getOrders() {
  const orders = await kv.get(ORDERS_KEY);
  return orders || [];
}

export async function saveOrders(orders) {
  await kv.set(ORDERS_KEY, orders);
}

export async function addOrder(order) {
  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  await saveOrders(orders);
  return orders[idx];
}

export async function savePendingOrder(order) {
  await kv.set(PENDING_PREFIX + order.id, order, { ex: 1800 });
}

export async function getPendingOrder(orderId) {
  return await kv.get(PENDING_PREFIX + orderId);
}

export async function deletePendingOrder(orderId) {
  await kv.del(PENDING_PREFIX + orderId);
}
