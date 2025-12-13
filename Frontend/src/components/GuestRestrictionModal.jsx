import { useTranslation } from "../hooks/useTranslation";
import { X } from "lucide-react";

export default function GuestRestrictionModal({ isOpen, onClose, onLogin, onRegister }) {
  const t = useTranslation();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    if (onLogin) {
      onLogin();
    }
  };

  const handleRegister = () => {
    onClose();
    if (onRegister) {
      onRegister();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">
            {t("guest.restrictionTitle")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-700 mb-6 text-lg">
            {t("guest.restrictionMessage")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogin}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              {t("guest.login")}
            </button>
            <button
              onClick={handleRegister}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t("guest.register")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


