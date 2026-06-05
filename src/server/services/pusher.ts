import Pusher from "pusher";

function hasPusherConfig() {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.PUSHER_CLUSTER,
  );
}

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.PUSHER_CLUSTER ?? "",
  useTLS: true,
});

export async function triggerRealtimeEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>,
) {
  if (!hasPusherConfig()) {
    return;
  }

  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error("Pusher event failed", error);
  }
}
