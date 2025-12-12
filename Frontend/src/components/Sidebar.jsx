import { Link } from "react-router-dom";
import { BookOpen, Plus, Search, FolderOpen, Sparkles, MoreHorizontal, BookPlus, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation";

export default function Sidebar({ onDarkModeToggle, isDarkMode = false, onCreatePost, onCreateBook, isOpen = false, onClose }) {
  const { user } = useAuth();
  const t = useTranslation();
  const isWriter = user?.role === "writer";
  const isAdmin = user?.role === "Admin" || user?.role === "admin";
  
  // Debug: Check user role
  if (user) {
    console.log("Sidebar - User object:", user);
    console.log("Sidebar - User role:", user.role);
    console.log("Sidebar - isAdmin:", isAdmin);
  }

  // Əsas menyu
  const mainMenuItems = [
    { label: t("nav.readingList"), to: "/reading-list", icon: BookOpen },
  ];

  // Əlavə linklər (Create Post-dan sonra gələcək)
  const extraMenuItems = [
    { label: t("nav.search"), to: "/search", icon: Search },
    { label: t("nav.categories"), to: "/categories", icon: FolderOpen },
    { label: t("nav.recommendations"), to: "/recommendations", icon: Sparkles },
    { label: t("nav.more"), to: "/more", icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 flex flex-col border-r transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {/* Logo */}
        <Link
          to="/"
          className={`p-6 border-b transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-100'}`}
          onClick={onClose}
        >
          <div className={`font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            BookVerse
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {mainMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {label}
                </Link>
              </li>
            ))}

            {/* Create Post düyməsi */}
            <li>
              <button
                onClick={() => {
                  onCreatePost();
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                  isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Plus className="w-5 h-5" />
                {t("nav.createPost")}
              </button>
            </li>

            {/* Xətt (divider) */}
            <li>
              <hr className={`my-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-300"}`} />
            </li>

            {/* Əlavə linklər */}
            {extraMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {label}
                </Link>
              </li>
            ))}

            {/* Admin Panel linki yalnız admin-lər üçün */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  {t("nav.admin") || "Admin Panel"}
                </Link>
              </li>
            )}

            {/* New Book düyməsi yalnız writer-lər üçün */}
            {isWriter && (
              <li>
                <button
                  onClick={() => {
                    onCreateBook();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <BookPlus className="w-5 h-5" />
                  {t("nav.newBook")}
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Dark Mode Toggle */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onDarkModeToggle}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Desktop sidebar - always visible */}
      <div className={`hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 flex-col border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {mainMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {label}
                </Link>
              </li>
            ))}

            {/* Create Post düyməsi */}
            <li>
              <button
                onClick={onCreatePost}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                  isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Plus className="w-5 h-5" />
                {t("nav.createPost")}
              </button>
            </li>

            {/* Xətt (divider) */}
            <li>
              <hr className={`my-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-300"}`} />
            </li>

            {/* Əlavə linklər */}
            {extraMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {label}
                </Link>
              </li>
            ))}

            {/* Admin Panel linki yalnız admin-lər üçün */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  {t("nav.admin") || "Admin Panel"}
                </Link>
              </li>
            )}

            {/* New Book düyməsi yalnız writer-lər üçün */}
            {isWriter && (
              <li>
                <button
                  onClick={onCreateBook}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm ${
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <BookPlus className="w-5 h-5" />
                  {t("nav.newBook")}
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Dark Mode Toggle */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onDarkModeToggle}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </>
  );
}
