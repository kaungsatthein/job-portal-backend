export function getCookieDomain(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    return parsed.hostname; // <-- extracts only domain
  } catch {
    return url.replace(/^https?:\/\//, '').split(':')[0]; // fallback
  }
}
