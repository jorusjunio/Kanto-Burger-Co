import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeAdminCallbackUrl } from "./routing";

test("admin callback URL sanitizer allows only admin-local paths", () => {
  assert.equal(sanitizeAdminCallbackUrl("/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/admin/orders"), "/admin/orders");
  assert.equal(sanitizeAdminCallbackUrl(null), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("https://example.com/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("//example.com/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/menu"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/administrator"), "/admin");
});
