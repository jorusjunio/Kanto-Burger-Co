import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

export const pusherClient =
  // Guard for the browser only: this module is also evaluated during
  // server-side rendering, where Node resolves pusher-js's node build
  // instead of the browser one, and its export isn't a valid constructor.
  typeof window !== "undefined" && pusherKey && pusherCluster
    ? new PusherClient(pusherKey, {
        cluster: pusherCluster,
        channelAuthorization: {
          endpoint: "/api/presence/auth",
          transport: "ajax",
        },
      })
    : null;
