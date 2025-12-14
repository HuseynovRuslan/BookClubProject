import { useState } from "react";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { changePassword } from "../api/users";
import { useTranslation } from "../hooks/useTranslation";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const t = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");


    if (!currentPassword) {
      setError(t("auth.passwordRequired") || "Current password is required");
      return;
    }

    if (!newPassword) {
      setError(t("auth.passwordRequired") || "New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch") || "Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError(t("settings.newPasswordSame") || "New password must be different from current password");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(t("settings.passwordChanged") || "Password changed successfully");
      

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      let errorMessage = t("error.default");
      
      if (err.translationKey) {
        errorMessage = t(err.translationKey);
      } else if (err.message) {
        const message = err.message.toLowerCase();
        if (message.includes("incorrect") || message.includes("wrong") || message.includes("invalid")) {
          errorMessage = t("settings.currentPasswordIncorrect") || "Current password is incorrect";
        } else if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
          errorMessage = t("error.network");
        } else if (err.status === 400 || err.status === 422) {
          errorMessage = t("error.400");
        } else if (err.status === 401) {
          errorMessage = t("error.401");
        } else {
          errorMessage = err.message;
        }
      } else if (err.status) {
        errorMessage = t(`error.${err.status}`) || t("error.default");
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-white rounded-3xl max-w-md w-full border-2 border-gray-200 dark:border-gray-200 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b-2 border-gray-200 dark:border-gray-200 bg-gradient-to-br from-amber-500 to-orange-500 bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-t-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900">
                {t("settings.changePasswordTitle")}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                {t("settings.currentPassword") || "Current Password"}
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-12 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showCurrentPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                {t("settings.newPassword") || "New Password"}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholderRegister")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-12 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showNewPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                {t("settings.confirmPassword") || "Confirm Password"}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-12 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-50 dark:via-orange-50 dark:to-red-50 border-2 border-red-300 dark:border-red-300 rounded-2xl shadow-xl">
                <p className="text-sm font-bold text-red-700 dark:text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-50 dark:via-emerald-50 dark:to-green-50 border-2 border-green-300 dark:border-green-300 rounded-2xl shadow-xl">
                <p className="text-sm font-bold text-green-700 dark:text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-black text-base transition-all shadow-2xl hover:shadow-amber-500/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? (t("common.saving") || "Saving...") : (t("settings.change") || "Change Password")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
