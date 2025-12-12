import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useTranslation } from "../hooks/useTranslation";
import { 
  Settings, 
  Info, 
  HelpCircle, 
  Shield, 
  FileText, 
  Mail, 
  BarChart3, 
  Award,
  Download,
  Trash2,
  BookOpen,
  Heart,
  X,
  Check
} from "lucide-react";

export default function MorePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, changeLanguage, languages } = useLanguage();
  const t = useTranslation();
  const [showClearCache, setShowClearCache] = useState(false);
  const [openModal, setOpenModal] = useState(null);

  const handleClearCache = () => {
    try {
      // Clear social feed cache
      localStorage.removeItem("bookverse_social_feed");
      // Clear other caches if needed
      setShowClearCache(false);
      setOpenModal(null);
      // Show success message
      setTimeout(() => {
        alert(t("more.cacheCleared"));
      }, 100);
    } catch (err) {
      console.error("Error clearing cache:", err);
      alert(t("more.cacheFailed"));
    }
  };

  const menuSections = [
    {
      title: t("more.statistics"),
      items: [
        {
          id: "reading-stats",
          icon: BookOpen,
          label: t("more.readingStats"),
          description: "Your reading progress and achievements",
          color: "from-purple-500 to-pink-500"
        },
        {
          id: "activity-overview",
          icon: BarChart3,
          label: t("more.activityOverview"),
          description: "View your activity and engagement",
          color: "from-indigo-500 to-purple-500"
        },
        {
          id: "achievements",
          icon: Award,
          label: t("more.achievements"),
          description: "Your badges and milestones",
          color: "from-amber-500 to-orange-500"
        }
      ]
    },
    {
      title: t("more.information"),
      items: [
        {
          id: "about",
          icon: Info,
          label: t("more.about"),
          description: "Learn more about our platform",
          color: "from-emerald-500 to-teal-500"
        },
        {
          id: "help",
          icon: HelpCircle,
          label: t("more.help"),
          description: "Get help and contact support",
          color: "from-blue-500 to-indigo-500"
        },
        {
          id: "contact",
          icon: Mail,
          label: t("more.contact"),
          description: "Send us feedback or suggestions",
          color: "from-violet-500 to-purple-500"
        }
      ]
    },
    {
      title: t("more.legalPrivacy"),
      items: [
        {
          id: "settings",
          icon: Settings,
          label: t("settings.title"),
          description: "App preferences and configuration",
          color: "from-gray-500 to-slate-500"
        },
        {
          id: "privacy",
          icon: Shield,
          label: t("more.privacy"),
          description: "How we protect your data",
          color: "from-green-500 to-emerald-500"
        },
        {
          id: "terms",
          icon: FileText,
          label: t("more.terms"),
          description: "Terms and conditions of use",
          color: "from-slate-500 to-gray-500"
        }
      ]
    },
    {
      title: t("more.dataManagement"),
      items: [
        {
          id: "export",
          icon: Download,
          label: t("more.export"),
          description: "Download your data",
          color: "from-cyan-500 to-blue-500"
        },
        {
          id: "clear-cache",
          icon: Trash2,
          label: t("more.clearCache"),
          description: "Clear cached data",
          color: "from-red-500 to-orange-500"
        }
      ]
    }
  ];

  const handleItemClick = (item) => {
    if (item.id === "clear-cache") {
      setShowClearCache(true);
    } else {
      setOpenModal(item.id);
    }
  };

  const getModalContent = (modalId) => {
    const content = {
      "reading-stats": {
        title: t("more.readingStats"),
        icon: BookOpen,
        color: "from-purple-500 to-pink-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              Your reading statistics and progress will be displayed here.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="text-3xl font-black text-purple-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Books Read</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                <div className="text-3xl font-black text-pink-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Pages Read</div>
              </div>
            </div>
          </div>
        )
      },
      "activity-overview": {
        title: t("more.activityOverview"),
        icon: BarChart3,
        color: "from-indigo-500 to-purple-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              View your activity and engagement on BookVerse.
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <div className="text-lg font-bold text-indigo-600 mb-1">Posts Created</div>
                <div className="text-2xl font-black text-indigo-700">0</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="text-lg font-bold text-purple-600 mb-1">Comments Made</div>
                <div className="text-2xl font-black text-purple-700">0</div>
              </div>
            </div>
          </div>
        )
      },
      "achievements": {
        title: t("more.achievements"),
        icon: Award,
        color: "from-amber-500 to-orange-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              Your badges and milestones will appear here.
            </p>
            <div className="text-center py-8">
              <Award className="w-24 h-24 text-amber-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">No achievements yet. Start reading to earn badges!</p>
            </div>
          </div>
        )
      },
      "about": {
        title: t("more.about"),
        icon: Info,
        color: "from-emerald-500 to-teal-500",
        content: (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-6xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                BookVerse
              </div>
              <p className="text-lg text-gray-600">Version 1.0.0</p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-700 leading-relaxed">
                BookVerse is your ultimate reading companion. Discover new books, share your thoughts, 
                connect with fellow readers, and build your personal library.
              </p>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <p className="text-sm text-gray-600">
                  Made with <Heart className="inline w-4 h-4 text-red-500" /> for readers around the world.
                </p>
              </div>
            </div>
          </div>
        )
      },
      "help": {
        title: t("more.help"),
        icon: HelpCircle,
        color: "from-blue-500 to-indigo-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              Need help? We're here for you!
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="font-bold text-blue-600 mb-2">Email Support</div>
                <div className="text-gray-700">support@bookverse.com</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <div className="font-bold text-indigo-600 mb-2">Response Time</div>
                <div className="text-gray-700">We typically respond within 24 hours</div>
              </div>
            </div>
          </div>
        )
      },
      "contact": {
        title: t("more.contact"),
        icon: Mail,
        color: "from-violet-500 to-purple-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              We'd love to hear from you! Send us your feedback, suggestions, or questions.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                <div className="font-bold text-violet-600 mb-2">Email</div>
                <div className="text-gray-700">contact@bookverse.com</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="font-bold text-purple-600 mb-2">Feedback</div>
                <div className="text-gray-700">Share your thoughts and help us improve!</div>
              </div>
            </div>
          </div>
        )
      },
      "settings": {
        title: t("settings.title"),
        icon: Settings,
        color: "from-gray-500 to-slate-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              {t("settings.selectLanguage")}
            </p>
            
            {/* Language Selection */}
            <div className="space-y-3">
              <div className="font-bold text-gray-900 dark:text-gray-900 mb-3 text-lg">
                {t("settings.language")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      language === lang.code
                        ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
                        : "border-gray-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                          language === lang.code
                            ? "bg-gradient-to-br from-amber-600 to-orange-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}>
                          {lang.nativeName.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 dark:text-gray-900">
                            {lang.nativeName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-600">
                            {lang.name}
                          </div>
                        </div>
                      </div>
                      {language === lang.code && (
                        <div className="p-1.5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Section */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-200">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <div className="font-bold text-gray-700 mb-2">{t("settings.notifications")}</div>
                <div className="text-sm text-gray-600">{t("settings.manageNotifications")}</div>
              </div>
            </div>
          </div>
        )
      },
      "privacy": {
        title: t("more.privacy"),
        icon: Shield,
        color: "from-green-500 to-emerald-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700 leading-relaxed">
              At BookVerse, we respect your privacy and are committed to protecting your personal data.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="font-bold text-green-600 mb-2">Data Collection</div>
                <div className="text-sm text-gray-700">
                  We only collect data necessary to provide you with the best reading experience.
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <div className="font-bold text-emerald-600 mb-2">Data Protection</div>
                <div className="text-sm text-gray-700">
                  Your data is encrypted and stored securely. We never share your information with third parties.
                </div>
              </div>
            </div>
          </div>
        )
      },
      "terms": {
        title: t("more.terms"),
        icon: FileText,
        color: "from-slate-500 to-gray-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700 leading-relaxed">
              By using BookVerse, you agree to the following terms and conditions:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
                <div className="font-bold text-slate-600 mb-2">User Conduct</div>
                <div className="text-sm text-gray-700">
                  Users must respect other members and maintain a positive community environment.
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <div className="font-bold text-gray-600 mb-2">Content Guidelines</div>
                <div className="text-sm text-gray-700">
                  All content shared must be appropriate and comply with our community guidelines.
                </div>
              </div>
            </div>
          </div>
        )
      },
      "export": {
        title: "Export Data",
        icon: Download,
        color: "from-cyan-500 to-blue-500",
        content: (
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-700">
              Download your data in a portable format.
            </p>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
              <div className="font-bold text-cyan-600 mb-2">Available Data</div>
              <div className="text-sm text-gray-700 space-y-2">
                <div>• Your reading list</div>
                <div>• Your posts and comments</div>
                <div>• Your profile information</div>
              </div>
            </div>
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Export Data
            </button>
          </div>
        )
      }
    };
    return content[modalId] || null;
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-10 py-12 relative z-10">
          <div className="flex items-center gap-5 mb-5">
            <div className="relative">
              <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
              <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                {t("more.title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                {t("more.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => handleItemClick(item)}
                    className="group relative p-6 bg-white dark:bg-white rounded-2xl border-2 border-gray-200 dark:border-gray-200 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] shadow-lg hover:shadow-xl text-left overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 dark:text-gray-900 group-hover:text-white transition-colors duration-300 mb-1 text-lg">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative Corner */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-150"></div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {openModal && getModalContent(openModal) && (() => {
        const modalData = getModalContent(openModal);
        const Icon = modalData.icon;
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={() => setOpenModal(null)}
          >
            <div 
              className="bg-white dark:bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-200 shadow-2xl animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`relative p-6 border-b-2 border-gray-200 dark:border-gray-200 bg-gradient-to-br ${modalData.color} bg-opacity-10`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-t-3xl"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${modalData.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900">
                      {modalData.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {modalData.content}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t-2 border-gray-200 dark:border-gray-200 flex justify-end">
              <button
                onClick={() => setOpenModal(null)}
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t("common.close")}
              </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Clear Cache Confirmation Modal */}
      {showClearCache && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-white p-8 rounded-3xl max-w-md w-full border-2 border-gray-200 dark:border-gray-200 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-900">
                {t("more.clearCacheConfirm")}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-600 mb-6 leading-relaxed">
              {t("more.clearCacheMessage")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearCache(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
              >
                {t("common.cancel")}
              </button>
              <button
                  onClick={handleClearCache}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t("common.delete")} Cache
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-200 text-center">
        <p className="text-gray-600 dark:text-gray-600 mb-2">
          <span className="font-bold text-amber-600 dark:text-amber-600">BookVerse</span> - Your Reading Companion
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Version 1.0.0 • Made with <Heart className="inline w-4 h-4 text-red-500" /> for readers
        </p>
      </div>
    </div>
  );
}
