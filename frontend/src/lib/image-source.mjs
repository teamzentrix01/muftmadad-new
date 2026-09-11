// Serve the existing database images through Next's cached image endpoint.
export const IMAGE_HOSTS = [
  "i.pinimg.com",
  "cdn-icons-png.flaticon.com",
  "www.eroftexas.com",
  "medlineplus.gov",
  "pinehouseeyecare.ca",
];

export function databaseImageSrc(value) {
  const src = typeof value === "string" ? value.trim() : "";
  if (!src) return undefined;
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && !url.port && IMAGE_HOSTS.includes(url.hostname)) {
      return `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;
    }
  } catch {
    // Local paths and uploaded data URLs keep their original source.
  }
  return src;
}
