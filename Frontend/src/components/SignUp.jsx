import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { login as loginAPI } from "../api/auth";

export default function SignUpPage({ onSwitchToSignIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nameRegex = /^[A-Za-zƏəÖöÜüĞğÇçİı\s]+$/;

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!name || !name.trim()) {
      setError("Name is required");
      return;
    }

    if (!nameRegex.test(name.trim())) {
      setError("Name can only contain letters");
      return;
    }

    if (!surname || !surname.trim()) {
      setError("Surname is required");
      return;
    }

    if (!nameRegex.test(surname.trim())) {
      setError("Surname can only contain letters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!birthDate) {
      setError("Birth date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: username.trim(),
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        password,
        birthDate: birthDate,
        role: "reader"
      });

      // Show success message
      setSuccess("Qeydiyyatdan uğurla keçdiniz! Giriş edirsiniz...");
      setIsSubmitting(false);
      
      // Store email and password for auto-login
      const savedEmail = email.trim();
      const savedPassword = password;

      // Clear form
      setUsername("");
      setName("");
      setSurname("");
      setEmail("");
      setPassword("");
      setBirthDate("");

      // Auto-login after registration and redirect to Social Feed
      setTimeout(async () => {
        try {
          // Auto-login using the API
          await loginAPI({ email: savedEmail, password: savedPassword });
          // Redirect to Social Feed after successful auto-login
          navigate("/social");
        } catch (loginErr) {
          // If auto-login fails, redirect to login page
          console.error("Auto-login failed:", loginErr);
          if (onSwitchToSignIn) {
            onSwitchToSignIn();
          } else {
            navigate("/login");
          }
        }
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 flex items-center justify-center px-4 py-8">
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
            Create Account
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-700 font-semibold">
            Join the BookVerse community today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-white rounded-3xl p-8 shadow-2xl border-2 border-white/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-black text-gray-900 dark:text-gray-900">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-black text-gray-900 dark:text-gray-900">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
              />
            </div>

            {/* Surname */}
            <div className="space-y-2">
              <label htmlFor="surname" className="block text-sm font-black text-gray-900 dark:text-gray-900">Surname</label>
              <input
                id="surname"
                type="text"
                placeholder="Enter your surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-black text-gray-900 dark:text-gray-900">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-black text-gray-900 dark:text-gray-900">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
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

            {/* Birth Date */}
            <div className="space-y-2">
              <label htmlFor="birthDate" className="block text-sm font-black text-gray-900 dark:text-gray-900">Doğum Günü (Birth Date)</label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-50 dark:to-amber-50/30 text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-300 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-md hover:shadow-lg"
              />
            </div>

            {/* Error & Success */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-black text-base transition-all shadow-2xl hover:shadow-amber-500/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="relative z-10">{isSubmitting ? "Creating account..." : "Create Account"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          <div className="mt-6 text-center pt-5 border-t-2 border-gray-100 dark:border-gray-100">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-700">
              Already have an account?{" "}
              <button onClick={onSwitchToSignIn} className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 font-black transition-all">
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
