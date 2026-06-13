export function shouldUnoptimizeImage(src: string) {
  if (src.startsWith("/")) {
    return false;
  }

  try {
    const url = new URL(src);
    return url.hostname !== "res.cloudinary.com";
  } catch {
    return true;
  }
}
