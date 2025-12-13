import { useState } from "react";
import { X, Mail, CheckCircle } from "lucide-react";
import { forgotPassword } from "../api/auth";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError("Email ünvanı daxil edin");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/50 z-50 flex items-center justify-center p-4" 
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">
            Şifrəni Unutmusan?
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">
                Email Göndərildi
              </h3>
              <p className="text-gray-700 dark:text-gray-700">
                Şifrə bərpa linki <strong>{email}</strong> ünvanına göndərildi. 
                Zəhmət olmasa email qutunuzu yoxlayın.
              </p>
              <button
                onClick={handleClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Bağla
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-amber-600 dark:text-amber-600" />
                </div>
                <p className="text-gray-700 dark:text-gray-700 text-lg">
                  Şifrəni unutmusan? Email ünvanını daxil et və biz sənə şifrə bərpa linki göndərəcəyik.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                    Email Ünvanı
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-50 dark:via-orange-50 dark:to-red-50 border-2 border-red-300 dark:border-red-300 rounded-2xl shadow-xl">
                    <p className="text-sm font-bold text-red-700 dark:text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? "Göndərilir..." : "Göndər"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

