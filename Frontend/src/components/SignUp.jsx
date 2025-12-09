import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignUpPage({ onSwitchToSignIn }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!nameRegex.test(name)) {
      setError("Name can only contain letters");
      return;
    }

    if (!nameRegex.test(surname)) {
      setError("Surname can only contain letters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username,
        name,
        surname,
        email,
        password,
        role: "reader"
      });

      setSuccess("Account created! Please check your inbox to confirm and sign in.");
      setUsername("");
      setName("");
      setSurname("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8 text-white">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 space-y-6 shadow">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">📚</span>
            <span className="text-purple-400 text-3xl font-bold">BookVerse</span>
          </div>

          <h2 className="text-2xl font-semibold">Create Your Account</h2>
          <p className="text-gray-400 text-center">Join the BookVerse community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Surname */}
          <div className="space-y-2">
            <label htmlFor="surname" className="block text-sm font-medium">Surname</label>
            <input
              id="surname"
              type="text"
              placeholder="Enter your surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Error & Success */}
          {error && (
            <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-400 bg-green-900/20 p-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button onClick={onSwitchToSignIn} className="text-purple-400 hover:underline">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
