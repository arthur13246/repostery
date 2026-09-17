export function checkAdminToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return Boolean(token) && Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;
}
