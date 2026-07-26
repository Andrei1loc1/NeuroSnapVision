import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(request.url);
    const params = url.searchParams.toString();

    const res = await fetch(`${BACKEND_URL}/protocol/today?${params}`, {
      method: "GET",
      headers: backendHeaders(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[today] Backend error:", text);
      return NextResponse.json(
        { error: "Failed to fetch today's protocol" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
