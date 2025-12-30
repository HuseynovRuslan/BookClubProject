import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navigation({
  isGuest = false,
  onShowLogin,
  onShowSignUp,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [feedType, setFeedType] = useState("for-you");

  // Check if we're on Social Feed page (routes "/" or "/social")
  const isSocialFeedPage = location.pathname === "/" || location.pathname === "/social";

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (direction === "down" && scrollY > 80) {
        setIsScrolled(true);
      } else if (direction === "up") {
        setIsScrolled(false);
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Update feedType based on current route
  useEffect(() => {
    if (isSocialFeedPage) {
      if (location.pathname === "/followers") {
        setFeedType("followers");
      } else {
        setFeedType("for-you");
      }
    }
  }, [location.pathname, isSocialFeedPage]);

  const handleFeedChange = (type) => {
    setFeedType(type);
    navigate(type === "for-you" ? "/" : "/followers");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-12 z-50 border-b bg-white border-gray-200 transition-transform duration-300 ${
        isScrolled ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 xl:px-6 h-full flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* CENTER – For You / Followers - Only show on Social Feed page */}
        {!isGuest && isSocialFeedPage && (
          <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => handleFeedChange("for-you")}
              className={`px-4 py-1 text-sm font-semibold rounded-full transition ${
                feedType === "for-you"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              For You
            </button>

            <button
              onClick={() => handleFeedChange("followers")}
              className={`px-4 py-1 text-sm font-semibold rounded-full transition ${
                feedType === "followers"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Followers
            </button>
          </div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {isGuest && (
            <>
              <button
                onClick={onShowLogin}
                className="px-3 py-1 text-xs font-semibold border rounded-lg hover:bg-gray-50"
              >
                Login
              </button>
              <button
                onClick={onShowSignUp}
                className="px-3 py-1 text-xs font-bold text-white rounded-lg bg-gradient-to-br from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
