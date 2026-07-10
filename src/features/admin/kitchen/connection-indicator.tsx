"use client";

import { useEffect, useState } from "react";

import { pusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";

type ConnectionState = "live" | "connecting" | "offline";

function toConnectionState(pusherState: string): ConnectionState {
  if (pusherState === "connected") return "live";
  if (pusherState === "connecting" || pusherState === "initialized") {
    return "connecting";
  }
  return "offline"; // disconnected / unavailable / failed
}

const labels: Record<ConnectionState, string> = {
  live: "Live",
  connecting: "Connecting…",
  offline: "Offline — orders may be missing",
};

/**
 * Tells the crew whether the board is actually receiving realtime updates.
 * A frozen board looks identical to a quiet night — this dot is the difference.
 */
export function ConnectionIndicator() {
  const [state, setState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const client = pusherClient;

    if (!client) {
      setState("offline");
      return;
    }

    setState(toConnectionState(client.connection.state));

    const handleChange = (states: { current: string }) => {
      setState(toConnectionState(states.current));
    };

    client.connection.bind("state_change", handleChange);
    return () => {
      client.connection.unbind("state_change", handleChange);
    };
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
        state === "live" && "bg-emerald-600/8 text-emerald-700",
        state === "connecting" && "bg-amber-500/10 text-amber-700",
        state === "offline" && "bg-red-600/10 text-red-700",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === "live" && "animate-pulse bg-emerald-500",
          state === "connecting" && "animate-pulse bg-amber-500",
          state === "offline" && "bg-red-600",
        )}
      />
      {labels[state]}
    </span>
  );
}
