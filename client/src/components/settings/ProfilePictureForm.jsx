import React, { useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import api from "utils/api";

const ProfilePictureForm = ({ user }) => {
  const { setUser } = useUser();
  const [preview, setPreview] = useState(
    user?.profilePicture || "http://localhost:3001/assets/defaultProfilePic.png"
  );
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

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview("http://localhost:3001/assets/defaultProfilePic.png");
  };

  const handleSave = async () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    setUploading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await api.post(
        "http://localhost:3001/api/users/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.data.profilePicture;

      // עדכון מקומי בתצוגה
      setPreview(imageUrl);
      setSelectedFile(null);
      setUploading(false);

      // עדכון בקונטקסט הגלובלי
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

      <button
        onClick={handleSave}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4"
      >
        {uploading ? "מעלה..." : "שמור תמונה"}
      </button>
    </div>
  );
};

export default ProfilePictureForm;
