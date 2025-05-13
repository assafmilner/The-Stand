import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg from "../../utils/cropImage";

const CropModal = ({ imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <>
      {/* רקע שחור שקוף */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50"></div>

      {/* המודאל עצמו */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-[90vw] h-[80vh] relative flex flex-col items-center justify-center p-4">
          <div className="relative w-full h-full">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3.5}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
            />
          </div>

          {/* כפתורים */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleDone}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              אישור
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CropModal;
