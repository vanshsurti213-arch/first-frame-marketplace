// ============================================================
// Firstframe V1 — Supabase Storage Helpers
// ============================================================

import { supabase } from "./client";

export interface UploadProgress {
  progress: number; // 0-100
  state: "running" | "success" | "error";
  error?: string;
}

const BUCKET = "firstframe";

/** Upload a file to Supabase Storage */
export async function uploadFile(
  folder: string,
  filePath: string,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  onProgress?.({ progress: 10, state: "running" });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(`${folder}/${filePath}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    onProgress?.({ progress: 0, state: "error", error: error.message });
    throw error;
  }

  onProgress?.({ progress: 100, state: "success" });

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/** Upload creator video */
export function uploadCreatorVideo(
  file: File,
  creatorId: string,
  onProgress?: (p: UploadProgress) => void
) {
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${creatorId}/video_${Date.now()}.${ext}`;
  const promise = uploadFile("creators", path, file, onProgress);
  return { promise };
}

/** Upload creator thumbnail */
export function uploadCreatorThumbnail(
  file: File,
  creatorId: string,
  onProgress?: (p: UploadProgress) => void
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${creatorId}/thumbnail_${Date.now()}.${ext}`;
  const promise = uploadFile("creators", path, file, onProgress);
  return { promise };
}

/** Delete a file from storage */
export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
