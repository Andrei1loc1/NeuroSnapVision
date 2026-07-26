import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const dataUrl = String(body.dataUrl ?? "");
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);

  if (!match) {
    return NextResponse.json(
      { error: "A valid base64 image data URL is required" },
      { status: 400 },
    );
  }

  const [, mimeType, base64] = match;
  const extension = allowedTypes.get(mimeType);

  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported image type" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(base64, "base64");

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Image is empty" }, { status: 400 });
  }

  if (buffer.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Imagine prea mare (max 5MB)" }, { status: 413 });
  }

  const fileName = `${randomUUID()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`scans/${fileName}`, buffer, {
        access: "private",
        contentType: mimeType,
      });

      return NextResponse.json({
        data: {
          url: `/api/uploads/scans/${encodeURIComponent(blob.pathname)}`,
          mimeType,
          sizeBytes: buffer.length,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Blob upload error";
      console.error("Scan image Blob upload failed:", message);

      return NextResponse.json(
        { error: "Blob upload failed" },
        { status: 500 },
      );
    }
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is required for uploads on Vercel" },
      { status: 500 },
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "scans");
  const diskPath = path.join(uploadDir, fileName);
  const url = `/uploads/scans/${fileName}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(diskPath, buffer);

  return NextResponse.json({
    data: {
      url,
      mimeType,
      sizeBytes: buffer.length,
    },
  });
}
