import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifySession } from "@/lib/server/session";

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("neurosnap_session")?.value;
  if (!token) return null;

  const userId = await verifySession(token);
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? { id: user.id, displayName: user.displayName } : null;
  } catch {
    return null;
  }
}