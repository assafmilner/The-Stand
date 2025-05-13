export default function getCroppedImg(imageSrc, crop) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const scale = 4; // תוכל גם להשתמש ב־3 או 4
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
  
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.95); // שמור על איכות גבוהה
      };
      image.onerror = (e) => reject(e);
    });
  }
  