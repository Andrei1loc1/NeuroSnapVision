/**
 * Image utility: converts a data URL (canvas.toDataURL) to a File object.
 * Useful for uploading captured camera photos via FormData.
 */
export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
