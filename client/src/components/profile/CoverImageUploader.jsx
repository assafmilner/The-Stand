import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import CropModal from "./CropModal";
import axios from "axios";

const CoverImageUploader = ({ user, isOwnProfile, colors, onCoverUpdate }) => {
  const [coverImage, setCoverImage] = useState(user?.coverImage);
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const coverInputRef = useRef(null);

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

  const uploadCroppedImage = async (croppedBlob) => {
    const formData = new FormData();
    formData.append("coverImage", croppedBlob);

    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:3001/api/users/upload-cover",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCoverImage(response.data.coverImage);
      onCoverUpdate(response.data.coverImage);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("שגיאה בהעלאת תמונת קאבר");
    } finally {
      setUploading(false);
      setCropModalOpen(false);
    }
  };

  return (
    <>
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

        <div className="cover-overlay" />

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

      {cropModalOpen && (
        <CropModal
          imageSrc={imageToCrop}
          onCancel={() => setCropModalOpen(false)}
          onCropComplete={uploadCroppedImage}
        />
      )}
    </>
  );
};

export default CoverImageUploader;
