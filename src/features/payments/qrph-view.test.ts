import assert from "node:assert/strict";
import test from "node:test";

import { EXPIRY_GRACE_MS, formatRemaining, getQrViewState } from "./qrph-view";

const EXPIRES = Date.parse("2026-09-11T14:55:00Z");

function state(overrides: Partial<Parameters<typeof getQrViewState>[0]> = {}) {
  return getQrViewState({
    status: "awaiting_next_action",
    hasQrImage: true,
    expiresAtMs: EXPIRES,
    now: EXPIRES - 60_000,
    ...overrides,
  });
}

test("a live QR before expiry is active", () => {
  assert.equal(state(), "active");
});

test("before mount (no clock yet) a live QR is still active, never expired", () => {
  assert.equal(state({ now: null }), "active");
});

test("stays active through the grace window right after expires_at", () => {
  assert.equal(state({ now: EXPIRES + EXPIRY_GRACE_MS - 1 }), "active");
});

test("becomes expired once the grace window passes", () => {
  assert.equal(state({ now: EXPIRES + EXPIRY_GRACE_MS }), "expired");
});

test("PayMongo reporting awaiting_payment_method means expired, whatever the clock says", () => {
  assert.equal(state({ status: "awaiting_payment_method", now: EXPIRES - 60_000 }), "expired");
});

test("processing and succeeded mean the customer paid and we are confirming", () => {
  assert.equal(state({ status: "processing", hasQrImage: false }), "confirming");
  assert.equal(state({ status: "succeeded", hasQrImage: false }), "confirming");
});

test("confirming wins over an elapsed clock, so a late webhook isn't shown as expired", () => {
  assert.equal(state({ status: "succeeded", now: EXPIRES + EXPIRY_GRACE_MS * 10 }), "confirming");
});

test("no QR image, a failed lookup or an unknown status is unavailable", () => {
  assert.equal(state({ hasQrImage: false }), "unavailable");
  assert.equal(state({ status: "unavailable", hasQrImage: false }), "unavailable");
  assert.equal(state({ status: "something_new" }), "unavailable");
});

test("a live QR without expires_at never expires on the client", () => {
  assert.equal(state({ expiresAtMs: null, now: EXPIRES * 2 }), "active");
});

test("formatRemaining renders m:ss and clamps at zero", () => {
  assert.equal(formatRemaining(0), "0:00");
  assert.equal(formatRemaining(61_000), "1:01");
  assert.equal(formatRemaining(29 * 60_000 + 5_000), "29:05");
  assert.equal(formatRemaining(1_500), "0:02");
  assert.equal(formatRemaining(-5_000), "0:00");
});
