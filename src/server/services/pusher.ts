import Pusher from "pusher";

function hasPusherConfig() {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.PUSHER_CLUSTER,
  );
}

let pusherServerInstance: Pusher | null = null;

function getPusherServer(): Pusher | null {
  if (!hasPusherConfig()) {
    return null;
  }

  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }

  return pusherServerInstance;
}

export async function triggerRealtimeEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>,
) {
  const pusher = getPusherServer();

  if (!pusher) {
    console.warn("Pusher not configured, skipping event trigger");
    return;
  }

  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error("Pusher event failed", error);
  }
}
