// ### Function: getCroppedImg
// Loads an image from a given source, crops it according to the specified crop object,
// scales it up for higher quality, and returns the cropped result as a JPEG Blob.
//
// Parameters:
// - imageSrc: string – source URL or base64 string of the image
// - crop: object – { x, y, width, height } defining crop boundaries
//
// Returns: Promise<Blob> – a promise that resolves to the cropped image as a blob

export default function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = crop.width * scale;
      canvas.height = crop.height * scale;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width * scale,
        crop.height * scale
      );

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    };
    image.onerror = (e) => reject(e);
  });
}
