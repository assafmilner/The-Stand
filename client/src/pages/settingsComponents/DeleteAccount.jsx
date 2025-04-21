import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const DeleteAccount = () => {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const handleDelete = () => {
    if (confirmText !== "מחק") {
      setError('כדי למחוק את החשבון, יש לכתוב "מחק" בתיבה');
      return;
    }

    setError("");
    // TODO: שלח בקשת DELETE לשרת
    console.log("משתמש ביקש למחוק את החשבון.");
  };

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-md text-right">
      <div className="flex items-center gap-2 text-red-700 mb-4">
        <AlertTriangle size={20} />
        <h3 className="text-lg font-semibold">זהירות – מחיקת חשבון</h3>
      </div>

      <p className="text-sm mb-4 text-red-700">
        מחיקת החשבון תסיר לצמיתות את כל המידע שלך מהרשת. פעולה זו אינה ניתנת
        לשחזור!
      </p>

      <label className="block text-sm font-medium text-red-800 mb-1">
        נא כתוב/י "מחק" כדי לאשר:
      </label>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full p-2 border border-red-300 rounded bg-white"
        placeholder="מחק"
      />

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          מחק חשבון
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
