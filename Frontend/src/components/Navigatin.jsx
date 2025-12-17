import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navigation({ isGuest = false, onShowLogin, onShowSignUp, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

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


  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== 'down' && scrollY < 10) {
        setIsScrolled(false);
      } else if (direction === 'down' && scrollY > 100) {
        setIsScrolled(true);
      } else if (direction === 'up') {
        setIsScrolled(false);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  return (
    <nav className={`fixed top-0 left-0 w-full h-16 z-50 border-b-2 bg-white border-gray-200 text-gray-900 transition-transform duration-300 ${
      isScrolled ? '-translate-y-full' : 'translate-y-0'
    }`}>
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
            null
          )}
        </div>
      </div>
    </nav>
  );
}
