import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, AlertTriangle } from "lucide-react";

const locations = ["צפון", "מרכז", "דרום", "ירושלים", "אחר"];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const PersonalInfo = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    user?.location || "אחר"
  );

  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSaveInfo = async () => {
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        "http://localhost:3001/api/users/update-profile",
        { bio, phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(res.data.message);
    } catch (err) {
      setError("שגיאה בעדכון המידע האישי");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
      {error && (
        <div className="col-span-2 flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="col-span-2 flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">שם מלא</label>
        <input
          value={user?.name}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">אימייל</label>
        <input
          value={user?.email}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">קבוצה אהודה</label>
        <input
          value={user?.favoriteTeam}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">מיקום</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>
            בחר מיקום
          </option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">מין</label>
        <input
          value={user?.gender}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">תאריך לידה</label>
        <input
          value={formatDate(user?.birthDate)}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">תאריך הצטרפות</label>
        <input
          value={formatDate(user?.createdAt)}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">טלפון</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="הזן טלפון..."
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium">ביוגרפיה קצרה</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded min-h-[100px]"
          placeholder="כתוב כאן קצת על עצמך..."
        />
      </div>

      <div className="col-span-2 flex justify-end mt-4 gap-3">
        <button
          type="button"
          onClick={handleSaveInfo}
          className="bg-primary px-4 py-2 rounded hover:opacity-90"
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
