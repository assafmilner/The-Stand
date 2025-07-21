import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg from "../../utils/cropImage";

/**
 * CropModal allows a user to crop an uploaded image.
 * It uses react-easy-crop to render a cropping interface.
 *
 * Props:
 * - imageSrc: the image to be cropped (as a data URL)
 * - onCancel: called when the user cancels cropping
 * - onCropComplete: called with the cropped image blob after confirmation
 */
const CropModal = ({ imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  /**
   * Saves cropped area pixels when cropping is complete.
   */
  const onCropCompleteHandler = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * Generates a cropped image blob and passes it back to the parent.
   */
  const handleDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <>
      {/* Dark transparent backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50"></div>

      {/* Modal wrapper */}
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

          {/* Action buttons */}
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
