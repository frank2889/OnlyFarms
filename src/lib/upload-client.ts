// Client-helper: bestand naar /api/upload (Vercel Blob) sturen
export async function uploadImage(file: File): Promise<{ url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error ?? "Upload mislukt." };
    return { url: data.url };
  } catch {
    return { error: "Upload mislukt. Controleer je verbinding." };
  }
}
