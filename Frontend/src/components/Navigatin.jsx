import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getImageUrl } from "../api/config";

export default function Navigation({ isGuest = false, onShowLogin, onShowSignUp, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Force image reload when avatar changes
  
  // Update avatar key when user avatar changes to force image reload
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarKey(prev => prev + 1);
      setImageError(false); // Reset error state when avatar changes
    }
  }, [user?.avatarUrl]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchClick = () => {
    if (!isGuest) {
      navigate("/search");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 border-b-2 bg-white border-gray-200 text-gray-900">
      <div className="max-w-[1920px] mx-auto px-6 xl:px-8 h-full flex items-center justify-between gap-4">
        {/* Left side - Hamburger menu + Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger menu for mobile and tablet - show for all users including guests */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-900 dark:text-gray-900"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extralight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px' }}>
              📚{" "}
              <span className="text-[#3B82F6]">BookVerse</span>
            </span>
          </Link>
        </div>

        

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {isGuest ? (
            <>
              <button
                onClick={onShowLogin}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Login
              </button>
              <button
                onClick={onShowSignUp}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="group relative"
                title="Open Profile"
              >
                {user?.avatarUrl && !imageError ? (
                  <img
                    src={(() => {
                      const imageUrl = getImageUrl(user.avatarUrl);
                      if (!imageUrl) return '';
                      // Add cache-busting parameter to force refresh when avatar changes
                      const separator = imageUrl.includes('?') ? '&' : '?';
                      return `${imageUrl}${separator}v=${avatarKey}`;
                    })()}
                    alt={user?.name || "Profile"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200 group-hover:border-amber-400 dark:group-hover:border-amber-400 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110"
                    onError={() => {
                      setImageError(true);
                    }}
                    key={`avatar-${user.avatarUrl}-${avatarKey}`} // Force re-render when avatarUrl or key changes
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-sm font-black text-white border-2 border-gray-200 dark:border-gray-200 group-hover:border-amber-400 dark:group-hover:border-amber-400 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "U"}
                  </div>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
