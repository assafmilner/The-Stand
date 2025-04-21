import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPasswords, setShowCurrentPasswords] = useState(false);
  const [showNewPasswords, setShowNewPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPasswords((prev) => !prev);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPasswords((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("הסיסמה החדשה ואימות הסיסמה אינם תואמים");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.put(
        "http://localhost:3001/api/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "שגיאה בשינוי הסיסמה");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right"
    >
      {error && (
        <div className="col-span-2 flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="col-span-2 flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          <span>הסיסמה עודכנה בהצלחה</span>
        </div>
      )}

      <div className="relative">
        <label className="block text-sm font-medium mb-1">סיסמה נוכחית</label>
        <input
          type={showCurrentPasswords ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <span
          className="absolute left-3 top-[38px] text-gray-500 cursor-pointer"
          onClick={toggleCurrentPasswordVisibility}
        >
          {showCurrentPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1">סיסמה חדשה</label>
        <input
          type={showNewPasswords ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <span
          className="absolute left-3 top-[38px] text-gray-500 cursor-pointer"
          onClick={toggleNewPasswordVisibility}
        >
          {showNewPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1">
          אימות סיסמה חדשה
        </label>
        <input
          type={showNewPasswords ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="col-span-2 flex justify-end mt-4">
        <button type="submit" className="px-4 py-2 bg-primary rounded">
          שמור סיסמה חדשה
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
