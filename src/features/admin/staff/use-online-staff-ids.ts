"use client";

import { useEffect, useState } from "react";
import type { PresenceChannel } from "pusher-js";

import { pusherClient } from "@/lib/pusher-client";

const PRESENCE_CHANNEL = "presence-staff";

function membersToIds(channel: PresenceChannel) {
  const ids = new Set<string>();
  channel.members.each((member: { id: string }) => ids.add(member.id));
  return ids;
}

/** Live set of user ids currently on any admin/kitchen page (see
    PresenceBeacon), drives the "Active now" indicator on the Staff page. */
export function useOnlineStaffIds() {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const client = pusherClient;

    if (!client) {
      return;
    }

    const channel = client.subscribe(PRESENCE_CHANNEL) as PresenceChannel;

    const sync = () => setOnlineIds(membersToIds(channel));

    channel.bind("pusher:subscription_succeeded", sync);
    channel.bind("pusher:member_added", sync);
    channel.bind("pusher:member_removed", sync);

    return () => {
      channel.unbind("pusher:subscription_succeeded", sync);
      channel.unbind("pusher:member_added", sync);
      channel.unbind("pusher:member_removed", sync);
      client.unsubscribe(PRESENCE_CHANNEL);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return onlineIds;
}
