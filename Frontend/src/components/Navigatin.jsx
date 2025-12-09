import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";

export default function Navigation({ isGuest = false, onShowLogin, onShowSignUp, isDarkMode = false, onToggleSidebar }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
    <nav className={`fixed top-0 left-0 w-full h-16 z-50 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}>
      <div className="max-w-[1920px] mx-auto px-6 xl:px-8 h-full flex items-center justify-between gap-4">
        {/* Left side - Hamburger menu + Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger menu for mobile */}
          {!isGuest && (
            <button
              onClick={onToggleSidebar}
              className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Toggle sidebar"
            >
              <svg
                className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
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
          )}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extralight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px' }}>
              📚{" "}
              <span className="text-[#3B82F6]">BookVerse</span>
            </span>
          </Link>
        </div>

        

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isGuest ? (
            <>
              <button
                onClick={onShowLogin}
                className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Login
              </button>
              <button
                onClick={onShowSignUp}
                className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
              >
                Register
              </button>
            </>
          ) : (
            <>
              {/* Mobile search icon */}
              <Link
                to="/search"
                className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Search"
              >
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              </Link>
              <Link
                to="/profile"
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${isDarkMode ? 'bg-purple-600' : 'bg-gray-900'}`}
                title="Open Profile"
              >
                <span>👤</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
