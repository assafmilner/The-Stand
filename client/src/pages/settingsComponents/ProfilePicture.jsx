import React, { useRef, useState } from "react";

const ProfilePicture = ({ user }) => {
  const [preview, setPreview] = useState(
    user?.profilePicture || "http://localhost:3001/assets/defaultProfilePic.png"
  );
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleSave = () => {
    if (selectedFile) {
      // שליחת selectedFile לשרת (TODO)
      console.log("Uploading:", selectedFile);
    } else {
      console.log("No file selected");
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
        className="flex justify-end gap-4 border-b pb-3 mb-6 flex-wrap"
      >
        שמור תמונה
      </button>
    </div>
  );
};

export default ProfilePicture;
