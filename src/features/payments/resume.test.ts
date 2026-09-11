import assert from "node:assert/strict";
import test from "node:test";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";

import {
  canResumePayment,
  resumePaymentWithDeps,
  type ResumableOrder,
} from "./resume";
import type { PaymentProvider, PaymentSession } from "./types";

const TOKEN = "tok_abc";

function pendingGcashOrder(overrides: Partial<ResumableOrder> = {}): ResumableOrder {
  return {
    id: "order_1",
    orderNumber: "KBC-1",
    trackingToken: TOKEN,
    total: 144,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.GCASH,
    paymentStatus: PaymentStatus.PENDING,
    paymentIntentId: "pi_old",
    paymentProvider: "paymongo",
    gcashReference: null,
    ...overrides,
  };
}

function setup(
  order: ResumableOrder | null,
  resumed: PaymentSession | null,
) {
  const calls = { resumed: [] as string[], created: 0, saved: [] as string[][] };

  const provider: PaymentProvider = {
    id: "paymongo",
    async createSession() {
      calls.created += 1;
      return { intentId: "pi_new", redirectUrl: "/checkout/pay/pi_new" };
    },
    parseCallback() {
      throw new Error("unused");
    },
    async resumeSession(intentId) {
      calls.resumed.push(intentId);
      return resumed;
    },
  };

  const deps = {
    provider,
    findOrder: async () => order,
    saveSession: async (orderId: string, intentId: string, providerId: string) => {
      calls.saved.push([orderId, intentId, providerId]);
    },
  };

  return { deps, calls };
}

test("reuses a still-payable session instead of minting a new one", async () => {
  const { deps, calls } = setup(pendingGcashOrder(), {
    intentId: "pi_old",
    redirectUrl: "/checkout/pay/pi_old",
  });

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: TOKEN },
    deps,
  );

  assert.deepEqual(result, { ok: true, redirectUrl: "/checkout/pay/pi_old" });
  assert.deepEqual(calls.resumed, ["pi_old"]);
  assert.equal(calls.created, 0);
  assert.equal(calls.saved.length, 0);
});

test("mints and saves a new session when the old one is expired", async () => {
  const { deps, calls } = setup(pendingGcashOrder(), null);

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: TOKEN },
    deps,
  );

  assert.deepEqual(result, { ok: true, redirectUrl: "/checkout/pay/pi_new" });
  assert.equal(calls.created, 1);
  assert.deepEqual(calls.saved, [["order_1", "pi_new", "paymongo"]]);
});

test("mints a session when checkout never managed to open one", async () => {
  const { deps, calls } = setup(
    pendingGcashOrder({ paymentIntentId: null, paymentProvider: null }),
    null,
  );

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: TOKEN },
    deps,
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls.resumed, []);
  assert.equal(calls.created, 1);
});

test("does not ask a different provider to resume another provider's session", async () => {
  const { deps, calls } = setup(pendingGcashOrder({ paymentProvider: "mock" }), {
    intentId: "pi_old",
    redirectUrl: "/checkout/pay/pi_old",
  });

  await resumePaymentWithDeps({ orderNumber: "KBC-1", trackingToken: TOKEN }, deps);

  assert.deepEqual(calls.resumed, []);
  assert.equal(calls.created, 1);
});

test("rejects a wrong tracking token without touching the gateway", async () => {
  const { deps, calls } = setup(pendingGcashOrder(), null);

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: "wrong" },
    deps,
  );

  assert.deepEqual(result, { ok: false, message: "Order not found." });
  assert.equal(calls.created, 0);
});

test("rejects an unknown order", async () => {
  const { deps } = setup(null, null);

  const result = await resumePaymentWithDeps(
    { orderNumber: "nope", trackingToken: TOKEN },
    deps,
  );

  assert.equal(result.ok, false);
});

test("refuses to reopen payment for an already-paid order", async () => {
  const { deps, calls } = setup(
    pendingGcashOrder({ paymentStatus: PaymentStatus.PAID }),
    null,
  );

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: TOKEN },
    deps,
  );

  assert.deepEqual(result, { ok: false, message: "This order is already paid." });
  assert.equal(calls.created, 0);
});

test("refuses cancelled orders and non-gateway payment methods", async () => {
  for (const overrides of [
    { status: OrderStatus.CANCELLED },
    { paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.UNPAID },
  ]) {
    const { deps, calls } = setup(pendingGcashOrder(overrides), null);

    const result = await resumePaymentWithDeps(
      { orderNumber: "KBC-1", trackingToken: TOKEN },
      deps,
    );

    assert.equal(result.ok, false);
    assert.equal(calls.created, 0);
  }
});

test("never opens online payment for a legacy manual-reference order (double-charge guard)", async () => {
  const { deps, calls } = setup(
    pendingGcashOrder({ gcashReference: "5001234567890", paymentIntentId: null }),
    null,
  );

  const result = await resumePaymentWithDeps(
    { orderNumber: "KBC-1", trackingToken: TOKEN },
    deps,
  );

  assert.equal(result.ok, false);
  assert.equal(calls.created, 0);
  assert.deepEqual(calls.resumed, []);
});

test("canResumePayment mirrors the action's eligibility rules", () => {
  assert.equal(canResumePayment(pendingGcashOrder()), true);
  assert.equal(canResumePayment(pendingGcashOrder({ paymentStatus: PaymentStatus.PAID })), false);
  assert.equal(canResumePayment(pendingGcashOrder({ status: OrderStatus.CANCELLED })), false);
  assert.equal(canResumePayment(pendingGcashOrder({ gcashReference: "ref" })), false);
  assert.equal(
    canResumePayment(
      pendingGcashOrder({ paymentMethod: PaymentMethod.COD, paymentStatus: PaymentStatus.UNPAID }),
    ),
    false,
  );
});
