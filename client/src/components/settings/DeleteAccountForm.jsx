import axios from "axios";
import React, { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

const DeleteAccountForm = () => {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "מחק") {
      setError('כדי למחוק את החשבון, יש לכתוב "מחק" בתיבה');
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.delete(
        "http://localhost:3001/api/users/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("נמחק:", response.data);
      setSuccess(true);

      setTimeout(() => {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error("שגיאה במחיקה:", err);
      setError("אירעה שגיאה במחיקת החשבון");
    }
  };

  return (
    <div className="text-right">
      <p className="mb-4 text-sm text-gray-700">
        אם אתה בטוח שברצונך למחוק את החשבון לצמיתות, כתוב "מחק" בתיבה ולחץ על
        הכפתור.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <CheckCircle size={18} />
          <span>החשבון נמחק בהצלחה!</span>
        </div>
      )}

      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder='כתוב כאן "מחק"...'
        className="w-full border rounded p-2 mb-4"
      />

      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        מחק חשבון
      </button>
    </div>
  );
};

export default DeleteAccountForm;