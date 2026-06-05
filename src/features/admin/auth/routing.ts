export function sanitizeAdminCallbackUrl(value: string | null) {
  if (!value || (value !== "/admin" && !value.startsWith("/admin/"))) {
    return "/admin";
  }

  if (value.startsWith("//")) {
    return "/admin";
  }

  return value;
}
