import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Search, FolderOpen, Sparkles, MoreHorizontal, BookPlus, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation";
import GuestRestrictionModal from "./GuestRestrictionModal";
import { useState } from "react";

export default function Sidebar({ onCreatePost, onCreateBook, isOpen = false, onClose, onShowLogin, onShowRegister }) {
  const { user, isGuest } = useAuth();
  const t = useTranslation();
  const location = useLocation();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const isWriter = user?.role === "writer";
  const isAdmin = user?.role === "Admin" || user?.role === "admin";
  
  // Check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/social";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

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
        className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 flex flex-col border-r transform transition-transform duration-300 ease-in-out md:hidden bg-white border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {mainMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                {isGuest ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowGuestModal(true);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </button>
                ) : (
                  <Link
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      isActive(to)
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </Link>
                )}
              </li>
            ))}

            {/* Create Post düyməsi */}
            <li>
              <button
                onClick={() => {
                  if (isGuest) {
                    setShowGuestModal(true);
                    onClose();
                    return;
                  }
                  onCreatePost();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
                {t("nav.createPost")}
              </button>
            </li>

            {/* Xətt (divider) */}
            <li>
              <hr className="my-4 border-t border-gray-300" />
            </li>

            {/* Əlavə linklər */}
            {extraMenuItems.map(({ label, to, icon: Icon }) => {
              // More sayfası guest mode'da kısıtlı
              const isRestricted = isGuest && to === "/more";
              return (
                <li key={label}>
                  {isRestricted ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowGuestModal(true);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {label}
                    </button>
                  ) : (
                    <Link
                      to={to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        isActive(to)
                          ? "bg-gray-200 text-gray-900 font-semibold"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}

            {/* Admin Panel linki yalnız admin-lər üçün */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive("/admin")
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "text-gray-900 hover:bg-gray-100"
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                >
                  <BookPlus className="w-5 h-5" />
                  {t("nav.newBook")}
                </button>
              </li>
            )}
          </ul>
        </nav>

      </div>

      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 flex-col border-r bg-white border-gray-200">
        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {mainMenuItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                {isGuest ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowGuestModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </button>
                ) : (
                  <Link
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      isActive(to)
                        ? "bg-gray-200 text-gray-900 font-semibold"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </Link>
                )}
              </li>
            ))}

            {/* Create Post düyməsi */}
            <li>
              <button
                onClick={() => {
                  if (isGuest) {
                    setShowGuestModal(true);
                    return;
                  }
                  onCreatePost();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
                {t("nav.createPost")}
              </button>
            </li>

            {/* Xətt (divider) */}
            <li>
              <hr className="my-4 border-t border-gray-300" />
            </li>

            {/* Əlavə linklər */}
            {extraMenuItems.map(({ label, to, icon: Icon }) => {
              // More sayfası guest mode'da kısıtlı
              const isRestricted = isGuest && to === "/more";
              return (
                <li key={label}>
                  {isRestricted ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowGuestModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {label}
                    </button>
                  ) : (
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        isActive(to)
                          ? "bg-gray-200 text-gray-900 font-semibold"
                          : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}

            {/* Admin Panel linki yalnız admin-lər üçün */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive("/admin")
                      ? "bg-gray-200 text-gray-900 font-semibold"
                      : "text-gray-900 hover:bg-gray-100"
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-900 hover:bg-gray-100"
                >
                  <BookPlus className="w-5 h-5" />
                  {t("nav.newBook")}
                </button>
              </li>
            )}
          </ul>
        </nav>

      </div>

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onLogin={onShowLogin}
        onRegister={onShowRegister}
      />
    </>
  );
}
