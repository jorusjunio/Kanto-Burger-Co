"use client";

import { useEffect } from "react";

import { pusherClient } from "@/lib/pusher-client";

const PRESENCE_CHANNEL = "presence-staff";

/**
 * Joins the shared staff presence channel for as long as this layout is
 * mounted, i.e. for as long as the signed-in user has an admin or kitchen
 * page open. No UI; it just makes them show up as "active now" wherever
 * someone is watching the presence list (see useOnlineStaffIds).
 */
export function PresenceBeacon() {
  useEffect(() => {
    const client = pusherClient;

    if (!client) {
      return;
    }

    client.subscribe(PRESENCE_CHANNEL);

    return () => {
      client.unsubscribe(PRESENCE_CHANNEL);
    };
  }, []);

  return null;
}
