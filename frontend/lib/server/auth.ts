import { NextResponse } from "next/server";

export function requireUserId(request: Request): string | NextResponse {
  const userId = request.headers.get("X-User-ID");
  if (!userId) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }
  return userId;
}