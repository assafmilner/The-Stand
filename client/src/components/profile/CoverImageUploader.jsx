import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import CropModal from "./CropModal";
import api from "utils/api";

/**
 * CoverImageUploader allows users to upload and update their profile cover image.
 * Includes support for cropping and preview before uploading.
 *
 * Props:
 * - user: the currently viewed user
 * - isOwnProfile: boolean indicating whether the profile is editable
 * - colors: fallback gradient colors if no image is present
 * - onCoverUpdate: callback when the cover image is successfully updated
 */
const CoverImageUploader = ({ user, isOwnProfile, colors, onCoverUpdate }) => {
  const [coverImage, setCoverImage] = useState(user?.coverImage);
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const coverInputRef = useRef(null);

  /**
   * Triggered when a file is selected.
   * Validates the file, reads it and opens crop modal.
   */
  const handleCoverUpload = (event) => {
    if (!isOwnProfile) return;

    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("הקובץ גדול מדי. גודל מקסימלי: 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("אנא בחר קובץ תמונה בלבד");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Uploads the cropped image to the server.
   * Sends multipart/form-data with Authorization header.
   */
  const uploadCroppedImage = async (croppedBlob) => {
    setCropModalOpen(false);

    const formData = new FormData();
    formData.append("coverImage", croppedBlob, "cover.jpg");

    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.post("/api/users/upload-cover", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCoverImage(response.data.coverImage);
      onCoverUpdate(response.data.coverImage);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("שגיאה בהעלאת תמונת קאבר");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Resets crop modal and input field if user cancels cropping.
   */
  const handleCropCancel = () => {
    setCropModalOpen(false);
    setImageToCrop(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Cover Image Section (gradient fallback if missing) */}
      <div className="relative profile-cover h-64 md:h-80 rounded-b-2xl overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
          />
        )}

        {/* Optional overlay styling for visual polish */}
        <div className="cover-overlay" />

        {/* Loading overlay during upload */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p>מעלה תמונה...</p>
            </div>
          </div>
        )}

        {/* Upload button (visible only on own profile) */}
        {isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="upload-cover-btn"
            disabled={uploading}
            title="שנה תמונת קאבר"
          >
            {uploading ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : (
              <Camera size={20} className="text-gray-700" />
            )}
          </button>
        )}

        {/* Hidden file input trigger */}
        {isOwnProfile && (
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        )}
      </div>

      {/* Crop modal logic */}
      {cropModalOpen && (
        <CropModal
          imageSrc={imageToCrop}
          onCancel={handleCropCancel}
          onCropComplete={uploadCroppedImage}
        />
      )}
    </>
  );
};

export default CoverImageUploader;
