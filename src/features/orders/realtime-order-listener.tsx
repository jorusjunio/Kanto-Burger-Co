"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { pusherClient } from "@/lib/pusher-client";

type RealtimeOrderListenerProps = {
  channelName: string;
  events: string[];
};

export function RealtimeOrderListener({
  channelName,
  events,
}: RealtimeOrderListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const client = pusherClient;

    if (!client) {
      return;
    }

    const channel = client.subscribe(channelName);
    const refresh = () => router.refresh();

    for (const event of events) {
      channel.bind(event, refresh);
    }

    return () => {
      for (const event of events) {
        channel.unbind(event, refresh);
      }

      client.unsubscribe(channelName);
    };
  }, [channelName, events, router]);

  return null;
}
