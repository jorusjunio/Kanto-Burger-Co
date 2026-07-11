import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeAdminCallbackUrl } from "./routing";

test("admin callback URL sanitizer allows only staff-area paths", () => {
  assert.equal(sanitizeAdminCallbackUrl("/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/admin/orders"), "/admin/orders");
  assert.equal(sanitizeAdminCallbackUrl("/kitchen"), "/kitchen");
  assert.equal(sanitizeAdminCallbackUrl(null), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("https://example.com/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("//example.com/admin"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("//example.com/kitchen"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/menu"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/administrator"), "/admin");
  assert.equal(sanitizeAdminCallbackUrl("/kitchenette"), "/admin");
});
