import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginPage({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loginAsGuest } = useAuth();

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password, rememberMe });
      // Redirect to Social Feed after successful login
      navigate("/social");
    } catch (err) {
      // Get user-friendly error message
      let errorMessage = t("error.login.unknownError");
      
      // Check if error has translation key
      if (err.translationKey) {
        errorMessage = t(err.translationKey);
      } else if (err.message) {
        // Check error message content for specific cases
        const message = err.message.toLowerCase();
        if (message.includes("invalid") || message.includes("incorrect") || message.includes("wrong")) {
          errorMessage = t("error.login.invalidCredentials");
        } else if (message.includes("not found") || message.includes("user not found") || message.includes("does not exist")) {
          errorMessage = t("error.login.userNotFound");
        } else if (message.includes("password")) {
          errorMessage = t("error.login.wrongPassword");
        } else if (message.includes("locked") || message.includes("blocked")) {
          errorMessage = t("error.login.accountLocked");
        } else if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
          errorMessage = t("error.login.networkError");
        } else if (err.status === 401) {
          errorMessage = t("error.login.invalidCredentials");
        } else if (err.status === 404) {
          errorMessage = t("error.login.userNotFound");
        } else if (err.status === 400 || err.status === 422) {
          errorMessage = t("error.login.invalidCredentials");
        } else {
          // Try to use translation if message is a translation key
          const translated = t(err.message);
          if (translated !== err.message) {
            errorMessage = translated;
          } else {
            // Use original message if it's already user-friendly
            errorMessage = err.message;
          }
        }
      } else if (err.status) {
        // Use status-based translation
        if (err.status === 401) {
          errorMessage = t("error.login.invalidCredentials");
        } else if (err.status === 404) {
          errorMessage = t("error.login.userNotFound");
        } else {
          errorMessage = t(`error.${err.status}`) || t("error.login.unknownError");
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header Section - Ultra Modern Design */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl">📚</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-amber-600 text-2xl font-bold">BookVerse</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-tight mb-2 drop-shadow-lg">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-700 font-semibold">
            Sign in to continue your reading journey
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-white rounded-3xl p-8 shadow-2xl border-2 border-white/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-black text-gray-900 dark:text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-12 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-lg border-2 border-gray-300 dark:border-gray-300 text-amber-600 focus:ring-amber-300 focus:ring-2 shadow-sm"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-bold text-gray-700 dark:text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-bold text-amber-600 dark:text-amber-600 hover:text-amber-700 dark:hover:text-amber-700 transition-colors"
              >
                Şifrəni unutmusan?
              </button>
            </div>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-50 dark:via-orange-50 dark:to-red-50 border-2 border-red-300 dark:border-red-300 rounded-2xl shadow-xl">
                <p className="text-sm font-bold text-red-700 dark:text-red-700">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-black text-base transition-all shadow-2xl hover:shadow-amber-500/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10">{isSubmitting ? "Signing in..." : "Sign In"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          <div className="mt-6 text-center pt-5 border-t-2 border-gray-100 dark:border-gray-100">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-700 mb-4">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignUp}
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 font-black transition-all"
              >
                Sign Up
              </button>
            </p>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 font-bold text-base transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
