/** Convert a YouTube/Vimeo/other URL into an embeddable iframe URL. */
export function toEmbedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;

  // YouTube (watch, youtu.be, embed, shorts)
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  // Already a full URL (assume it's directly embeddable)
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}
