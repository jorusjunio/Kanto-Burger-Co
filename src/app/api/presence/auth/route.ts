import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/session";
import { authorizePresenceChannel } from "@/server/services/pusher";

/**
 * Pusher presence-channel auth. Any signed-in staff/admin joining
 * "presence-staff" gets stamped with their own user id. The client can't
 * spoof who they are, since it comes from the session cookie, not the request
 * body. This is what powers the "active now" indicator on the Staff page.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const socketId = form.get("socket_id");
  const channelName = form.get("channel_name");

  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Only the staff presence channel is handed out through this endpoint.
  if (channelName !== "presence-staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = authorizePresenceChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { name: session.user.name, role: session.user.role },
  });

  if (!auth) {
    return NextResponse.json(
      { error: "Realtime not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json(auth);
}
