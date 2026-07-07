import assert from "node:assert/strict";
import test from "node:test";

import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

import {
  assertCanSettleToPaid,
  canSettleToPaid,
  isAlreadyPaid,
  isGatewayPaymentMethod,
  PaymentSettlementError,
} from "./lifecycle";

test("GCash is a gateway method; cash/COD are not", () => {
  assert.equal(isGatewayPaymentMethod(PaymentMethod.GCASH), true);
  assert.equal(isGatewayPaymentMethod(PaymentMethod.CASH), false);
  assert.equal(isGatewayPaymentMethod(PaymentMethod.COD), false);
});

test("a PENDING GCash order can settle to PAID", () => {
  assert.equal(
    canSettleToPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.PENDING,
    }),
    true,
  );
});

test("cash/COD orders can never auto-settle", () => {
  assert.equal(
    canSettleToPaid({
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
    }),
    false,
  );
  assert.equal(
    canSettleToPaid({
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
    }),
    false,
  );
});

test("only PENDING gateway orders settle (UNPAID/PAID are rejected)", () => {
  assert.equal(
    canSettleToPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.UNPAID,
    }),
    false,
  );
  assert.equal(
    canSettleToPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.PAID,
    }),
    false,
  );
});

test("isAlreadyPaid detects settled orders (idempotency signal)", () => {
  assert.equal(
    isAlreadyPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.PAID,
    }),
    true,
  );
  assert.equal(
    isAlreadyPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.PENDING,
    }),
    false,
  );
});

test("assertCanSettleToPaid throws for non-settleable orders", () => {
  assert.throws(
    () =>
      assertCanSettleToPaid({
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PENDING,
      }),
    PaymentSettlementError,
  );

  assert.doesNotThrow(() =>
    assertCanSettleToPaid({
      paymentMethod: PaymentMethod.GCASH,
      paymentStatus: PaymentStatus.PENDING,
    }),
  );
});
