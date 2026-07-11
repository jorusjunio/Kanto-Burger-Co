/**
 * Staff-area callback allowlist: /admin pages and the kitchen board. Anything
 * else (external URLs, protocol-relative tricks, storefront paths) falls back
 * to /admin — role guards there bounce STAFF on to /kitchen.
 */
export function sanitizeAdminCallbackUrl(value: string | null) {
  if (!value || value.startsWith("//")) {
    return "/admin";
  }

  const isAdminPath = value === "/admin" || value.startsWith("/admin/");
  const isKitchenPath = value === "/kitchen" || value.startsWith("/kitchen/");

  if (!isAdminPath && !isKitchenPath) {
    return "/admin";
  }

  return value;
}
