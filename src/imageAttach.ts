// src/imageAttach.ts
// Compresses a user-selected image in the browser before it is stored or sent to the Earth link.
import type { ImageAttachment } from './triage'

// Standard browser APIs only (createImageBitmap, canvas). No dependencies.
// Re-encoding through a canvas also drops EXIF metadata (GPS, device info) from the stored copy.

export type AttachedImage = ImageAttachment

export const ATTACHMENT_LABEL =
  "Stored with this check-in. No onboard analysis: this app does not interpret the image. It is not yet sent to Earth automatically.";
// When the Earth link carries images, change the last sentence to: It goes to the flight surgeon with your report.

const MAX_EDGE = 1280;      // longest side in pixels
const MAX_BYTES = 250_000;  // target ceiling per image (~250 KB). Tune if your storage allows more.

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read image"));
    r.readAsDataURL(blob);
  });
}

export async function compressImage(
  file: File,
  maxEdge: number = MAX_EDGE,
  maxBytes: number = MAX_BYTES
): Promise<AttachedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Some browsers cannot decode HEIC/HEIF; tell the user instead of failing silently.
    throw new Error("This image format is not supported by the browser. Try a JPEG or PNG.");
  }

  let scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  let blob: Blob | null = null;
  let width = 0;
  let height = 0;

  // Try quality steps first, then shrink dimensions if still too large (max 4 shrink rounds).
  for (let round = 0; round < 4; round++) {
    width = Math.max(1, Math.round(bitmap.width * scale));
    height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    ctx.fillStyle = "#ffffff"; // PNGs with transparency would otherwise turn black in JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    for (let q = 0.85; q >= 0.45; q -= 0.1) {
      blob = await canvasToBlob(canvas, q);
      if (blob.size <= maxBytes) break;
    }
    if (blob && blob.size <= maxBytes) break;
    scale *= 0.8;
  }
  bitmap.close();

  if (!blob) throw new Error("Could not compress image.");
  if (blob.size > maxBytes * 1.5) {
    throw new Error("Image is still too large after compression. Try a smaller image.");
  }

  return {
    dataUrl: await blobToDataUrl(blob),
    width,
    height,
    bytes: blob.size,
    attachedAt: new Date().toISOString(),
  };
}
