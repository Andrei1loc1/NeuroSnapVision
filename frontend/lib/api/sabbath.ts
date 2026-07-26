import { prisma } from "@/lib/db/prisma";

export async function isSabbathDay(userId: string): Promise<boolean> {
  const sabbath = await prisma.digitalSabbath.findUnique({
    where: { userId },
  });

  if (!sabbath || !sabbath.isActive) return false;

  const today = new Date().getDay();
  return sabbath.sabbathDay === today;
}

export function getSabbathMessage(): string {
  return "Astăzi nu ești o colecție de date. Astăzi doar exiști. Ești suficient.";
}