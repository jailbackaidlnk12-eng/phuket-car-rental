/**
 * Local file storage for uploads
 * Replaces the Forge storage proxy with local filesystem
 */

import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join, dirname, extname } from "path";
import { nanoid } from "nanoid";

const UPLOADS_DIR = "./uploads";

/**
 * Ensure uploads directory exists
 */
function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "application/octet-stream": ".bin",
  };
  return map[contentType] || ".bin";
}

/**
 * Store a file locally
 * @param relKey - Relative path/key for the file
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Generate unique filename if relKey doesn't have extension
  const ext = extname(relKey) || getExtensionFromContentType(contentType);
  const filename = relKey.includes(".")
    ? relKey.replace(/[^a-zA-Z0-9.-]/g, "_")
    : `${nanoid(12)}${ext}`;

  // Determine subdirectory from relKey
  const subdir = dirname(relKey) !== "." ? dirname(relKey).replace(/[^a-zA-Z0-9/]/g, "_") : "";
  const targetDir = subdir ? join(UPLOADS_DIR, subdir) : UPLOADS_DIR;

  ensureDir(targetDir);

  const filePath = join(targetDir, filename);
  const key = subdir ? `${subdir}/${filename}` : filename;

  // Write file
  if (typeof data === "string") {
    writeFileSync(filePath, data, "utf-8");
  } else {
    writeFileSync(filePath, data);
  }

  // Return local URL
  const url = `/uploads/${key}`;

  return { key, url };
}

/**
 * Get URL for a stored file
 * @param relKey - Relative path/key for the file
 * @returns Object with key and URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const url = `/uploads/${key}`;
  return { key, url };
}

/**
 * Delete a file from storage
 * @param relKey - Relative path/key for the file
 */
export async function storageDelete(relKey: string): Promise<void> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = join(UPLOADS_DIR, key);

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

/**
 * Store uploaded file from base64
 * @param base64Data - Base64 encoded file data (with or without data URL prefix)
 * @param folder - Subfolder to store in
 * @returns Object with key and URL
 */
export async function storeBase64File(
  base64Data: string,
  folder = "uploads"
): Promise<{ key: string; url: string }> {
  // Parse data URL if present
  let contentType = "application/octet-stream";
  let base64Content = base64Data;

  if (base64Data.startsWith("data:")) {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      contentType = matches[1];
      base64Content = matches[2];
    }
  }

  const buffer = Buffer.from(base64Content, "base64");
  const ext = getExtensionFromContentType(contentType);
  const filename = `${nanoid(12)}${ext}`;

  return storagePut(`${folder}/${filename}`, buffer, contentType);
}
