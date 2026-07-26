import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { BACKEND_URL, backendHeaders } from "@/lib/server/env";

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/protocol/morning`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...backendHeaders() },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[morning] Backend error:", text);
      return NextResponse.json(
        { error: "Failed to fetch morning protocol" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
