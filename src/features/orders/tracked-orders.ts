"use client";

import { useEffect, useState } from "react";

/**
 * Client-side store for the orders a customer is tracking. Persisted in
 * localStorage so it survives reloads, kept in placement order so each entry
 * can be numbered (#1, #2, ...). Mutations broadcast a custom event so every
 * mounted consumer (sidebar list, nav badge) stays in sync within the tab,
 * and a `storage` listener keeps other tabs in sync too.
 */
export type TrackedOrder = {
  orderNumber: string;
  token: string;
  placedAt: number;
};

const STORAGE_KEY = "kanto:trackedOrders";
const LEGACY_KEY = "activeOrder";
const CHANGED_EVENT = "kanto:tracked-orders-changed";

function isTrackedOrder(value: unknown): value is TrackedOrder {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as TrackedOrder).orderNumber === "string" &&
    typeof (value as TrackedOrder).token === "string"
  );
}

export function getTrackedOrders(): TrackedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTrackedOrder);
  } catch {
    return [];
  }
}

function persist(orders: TrackedOrder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

export function addTrackedOrder(order: { orderNumber: string; token: string }) {
  if (typeof window === "undefined") return;
  const orders = getTrackedOrders();
  // Dedupe by order number so refreshing/revisiting a receipt never doubles up.
  if (orders.some((existing) => existing.orderNumber === order.orderNumber)) {
    return;
  }
  persist([
    ...orders,
    { orderNumber: order.orderNumber, token: order.token, placedAt: Date.now() },
  ]);
}

export function removeTrackedOrder(orderNumber: string) {
  if (typeof window === "undefined") return;
  persist(getTrackedOrders().filter((o) => o.orderNumber !== orderNumber));
}

/** Fold the old single-order key into the multi-order list, once. */
function migrateLegacyActiveOrder() {
  if (typeof window === "undefined") return;
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const parsed: unknown = JSON.parse(legacy);
    if (isTrackedOrder(parsed)) {
      addTrackedOrder({ orderNumber: parsed.orderNumber, token: parsed.token });
    }
  } catch {
    // ignore malformed legacy value
  } finally {
    window.localStorage.removeItem(LEGACY_KEY);
  }
}

/** Reactive view of the tracked orders, ordered by placement (oldest first). */
export function useTrackedOrders(): TrackedOrder[] {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);

  useEffect(() => {
    migrateLegacyActiveOrder();
    const sync = () => setOrders(getTrackedOrders());
    sync();
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return orders;
}
