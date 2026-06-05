import assert from "node:assert/strict";
import test from "node:test";

import { OrderStatus } from "@/generated/prisma/enums";

import {
  assertAllowedStatusTransition,
  isAllowedStatusTransition,
} from "./lifecycle";

test("allows forward order status transitions", () => {
  assert.equal(
    isAllowedStatusTransition(OrderStatus.PENDING, OrderStatus.PREPARING),
    true,
  );
  assert.equal(
    isAllowedStatusTransition(OrderStatus.PREPARING, OrderStatus.READY),
    true,
  );
  assert.equal(
    isAllowedStatusTransition(OrderStatus.READY, OrderStatus.COMPLETED),
    true,
  );
  assert.equal(
    isAllowedStatusTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED),
    true,
  );
});

test("allows cancelling active orders", () => {
  assert.equal(
    isAllowedStatusTransition(OrderStatus.PENDING, OrderStatus.CANCELLED),
    true,
  );
  assert.equal(
    isAllowedStatusTransition(OrderStatus.READY, OrderStatus.CANCELLED),
    true,
  );
});

test("prevents terminal order status changes", () => {
  assert.equal(
    isAllowedStatusTransition(OrderStatus.COMPLETED, OrderStatus.CANCELLED),
    false,
  );
  assert.equal(
    isAllowedStatusTransition(OrderStatus.CANCELLED, OrderStatus.PREPARING),
    false,
  );
});

test("throws a readable error for invalid transitions", () => {
  assert.throws(
    () =>
      assertAllowedStatusTransition(OrderStatus.COMPLETED, OrderStatus.PENDING),
    /Cannot move order from COMPLETED to PENDING/,
  );
});
