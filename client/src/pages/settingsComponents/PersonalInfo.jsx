import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, AlertTriangle } from "lucide-react";

const locations = ["צפון", "מרכז", "דרום", "ירושלים", "אחר"];

const PersonalInfo = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    user?.location || ""
  );
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpdateLocation = async () => {
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        "http://localhost:3001/api/users/update-location",
        { location: selectedLocation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(res.data.message);
    } catch (err) {
      setError("שגיאה בעדכון המיקום");
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

      <div className="col-span-2 flex justify-end mt-4">
        <button
          type="button"
          className="bg-primary px-4 py-2 rounded hover:opacity-90"
          onClick={handleUpdateLocation}
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
