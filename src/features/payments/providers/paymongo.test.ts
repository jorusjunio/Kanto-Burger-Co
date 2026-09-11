import assert from "node:assert/strict";
import test from "node:test";

import {
  getChargeableSource,
  getPaymongoEventType,
  paymongoPaymentProvider,
} from "./paymongo";

function paymentEvent(type: "payment.paid" | "payment.failed", sourceId: string) {
  return {
    data: {
      attributes: {
        type,
        data: {
          id: "pay_abc123",
          attributes: {
            source: { id: sourceId },
          },
        },
      },
    },
  };
}

test("parseCallback normalizes a payment.paid event to SUCCEEDED", () => {
  const callback = paymongoPaymentProvider.parseCallback(
    paymentEvent("payment.paid", "src_xyz789"),
  );

  assert.deepEqual(callback, { intentId: "src_xyz789", outcome: "SUCCEEDED" });
});

test("parseCallback normalizes a payment.failed event to FAILED", () => {
  const callback = paymongoPaymentProvider.parseCallback(
    paymentEvent("payment.failed", "src_xyz789"),
  );

  assert.deepEqual(callback, { intentId: "src_xyz789", outcome: "FAILED" });
});

test("parseCallback normalizes a QR Ph payment (payment_intent_id, no source) to SUCCEEDED", () => {
  const callback = paymongoPaymentProvider.parseCallback({
    data: {
      attributes: {
        type: "payment.paid",
        data: {
          id: "pay_qrph1",
          attributes: { payment_intent_id: "pi_abc123", source: null },
        },
      },
    },
  });

  assert.deepEqual(callback, { intentId: "pi_abc123", outcome: "SUCCEEDED" });
});

test("parseCallback prefers payment_intent_id over source when both are present", () => {
  const callback = paymongoPaymentProvider.parseCallback({
    data: {
      attributes: {
        type: "payment.paid",
        data: {
          id: "pay_both",
          attributes: { payment_intent_id: "pi_both1", source: { id: "src_both1" } },
        },
      },
    },
  });

  assert.equal(callback.intentId, "pi_both1");
});

test("parseCallback rejects a payload missing the source id", () => {
  assert.throws(() =>
    paymongoPaymentProvider.parseCallback({
      data: { attributes: { type: "payment.paid", data: { attributes: {} } } },
    }),
  );
});

test("getPaymongoEventType reads the event type without validating the rest", () => {
  assert.equal(
    getPaymongoEventType({ data: { attributes: { type: "source.chargeable" } } }),
    "source.chargeable",
  );
  assert.equal(getPaymongoEventType({ data: {} }), null);
  assert.equal(getPaymongoEventType(null), null);
});

test("getChargeableSource extracts the source id and centavo amount", () => {
  const payload = {
    data: {
      attributes: {
        data: {
          id: "src_chargeable1",
          attributes: { amount: 15000 },
        },
      },
    },
  };

  assert.deepEqual(getChargeableSource(payload), {
    id: "src_chargeable1",
    amountCentavos: 15000,
  });
});

test("getChargeableSource returns null for a malformed payload", () => {
  assert.equal(getChargeableSource({ data: {} }), null);
});
