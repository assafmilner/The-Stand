import React, { useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import api from "utils/api";

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/ddygnvbr7/image/upload/v1752662044/defaultProfilePic_pngf2x.png";

const ProfilePictureForm = ({ user }) => {
  const { setUser } = useUser();
  const [preview, setPreview] = useState(user?.profilePicture || DEFAULT_PROFILE_PIC);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = async () => {
    const token = localStorage.getItem("accessToken");
    setSelectedFile(null);
    setPreview(DEFAULT_PROFILE_PIC);

    try {
      await api.put(
        "/api/users/update-profile",
        { profilePicture: DEFAULT_PROFILE_PIC },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        profilePicture: DEFAULT_PROFILE_PIC,
      }));

      console.log("תמונת ברירת מחדל נשמרה");
    } catch (err) {
      console.error("שגיאה בהסרת תמונה:", err);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");

    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    setUploading(true);

    try {
      const response = await api.post("/api/users/upload-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.profilePicture;

      setPreview(imageUrl);
      setSelectedFile(null);
      setUploading(false);

      setUser((prev) => ({
        ...prev,
        profilePicture: imageUrl,
      }));
    } catch (err) {
      console.error("שגיאה בהעלאת תמונה:", err);
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <img
        src={preview}
        alt="Profile Preview"
        className="w-32 h-32 rounded-full object-cover border shadow-md"
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-4">
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          בחר תמונה
        </button>

        <button
          onClick={handleRemove}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          הסר תמונה
        </button>
      </div>

      {selectedFile && (
        <button
          onClick={handleSave}
          disabled={uploading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4"
        >
          {uploading ? "מעלה..." : "שמור תמונה"}
        </button>
      )}
    </div>
  );
};

export default ProfilePictureForm;
