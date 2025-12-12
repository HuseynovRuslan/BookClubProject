import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useTranslation } from "../hooks/useTranslation";
import { useShelves } from "../context/ShelvesContext.jsx";
import { getMyReviews } from "../api/users";
import { 
  Settings, 
  Info, 
  Mail, 
  BarChart3, 
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
  const { shelves } = useShelves();
  const [openModal, setOpenModal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [booksReadCount, setBooksReadCount] = useState(0);

  const menuSections = [
    {
      title: t("more.statistics"),
      items: [
        {
          id: "reading-stats",
          icon: BookOpen,
          label: t("more.readingStats"),
          description: t("more.readingStatsDescription"),
          color: "from-purple-500 to-pink-500"
        },
        {
          id: "activity-overview",
          icon: BarChart3,
          label: t("more.activityOverview"),
          description: t("more.activityOverviewDescription"),
          color: "from-indigo-500 to-purple-500"
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
          description: t("more.aboutDescription"),
          color: "from-emerald-500 to-teal-500"
        },
        {
          id: "contact",
          icon: Mail,
          label: t("more.contact"),
          description: t("more.contactDescriptionShort"),
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
          description: t("more.settingsDescription"),
          color: "from-gray-500 to-slate-500"
        }
      ]
    }
  ];

  // Load user statistics
  useEffect(() => {
    const loadStatistics = async () => {
      setLoadingStats(true);
      try {
        const userReviews = await getMyReviews();
        setReviews(userReviews || []);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      loadStatistics();
    }
  }, [user]);

  // Load books read count from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookverse_books_read_count");
      if (stored) {
        const count = parseInt(stored, 10);
        if (!isNaN(count) && count >= 0) {
          setBooksReadCount(count);
        }
      }
    } catch (err) {
      console.error("Error loading books read count from localStorage:", err);
    }
  }, []);

  // Calculate reading statistics and update localStorage
  useEffect(() => {
    if (!shelves || shelves.length === 0) {
      return;
    }

    // Find "Read" shelf - check for various translations
    const readShelfName = t("readingList.read") || "Read";
    const readShelfNames = [
      readShelfName.toLowerCase(),
      "read", 
      "bitmiş", 
      "finished", 
      "oxunub", 
      "tamamlanmış",
      "tamamlanıb"
    ];
    const readShelf = shelves.find(shelf => {
      const shelfName = (shelf.name || "").toLowerCase().trim();
      return readShelfNames.some(name => shelfName === name || shelfName.includes(name));
    });

    const booksInReadShelf = readShelf?.books || [];
    const currentBooksRead = booksInReadShelf.length;

    // Update localStorage only if current count is greater than stored count
    // This ensures the count never decreases even if books are removed from Read shelf
    try {
      const stored = localStorage.getItem("bookverse_books_read_count");
      const storedCount = stored ? parseInt(stored, 10) : 0;
      
      if (!isNaN(storedCount) && currentBooksRead > storedCount) {
        localStorage.setItem("bookverse_books_read_count", currentBooksRead.toString());
        setBooksReadCount(currentBooksRead);
      } else if (isNaN(storedCount) || storedCount === 0) {
        // If no stored value or stored value is 0, set current count
        localStorage.setItem("bookverse_books_read_count", currentBooksRead.toString());
        setBooksReadCount(currentBooksRead);
      }
      // If currentBooksRead <= storedCount, keep the stored value (don't decrease)
    } catch (err) {
      console.error("Error saving books read count to localStorage:", err);
    }
  }, [shelves, t]);

  // Calculate reading statistics (use stored count from localStorage)
  const readingStats = useMemo(() => {
    return { booksRead: booksReadCount };
  }, [booksReadCount]);

  // Calculate activity statistics
  const activityStats = useMemo(() => {
    // Get posts from localStorage
    let postsCount = 0;
    let commentsCount = 0;

    try {
      const socialFeedData = localStorage.getItem("bookverse_social_feed");
      if (socialFeedData) {
        const posts = JSON.parse(socialFeedData);
        if (Array.isArray(posts)) {
          // Count posts created by current user
          const userId = user?.id || user?.Id;
          const userName = user?.name || user?.username || user?.Username;
          
          postsCount = posts.filter(post => {
            const postUserId = post.userId || post.UserId || post.user?.id || post.user?.Id;
            const postUsername = post.username || post.Username;
            return postUserId === userId || postUsername === userName;
          }).length;

          // Count comments made by current user
          posts.forEach(post => {
            if (post.comments && Array.isArray(post.comments)) {
              const userComments = post.comments.filter(comment => {
                const commentUsername = comment.username || comment.Username;
                return commentUsername === userName;
              });
              commentsCount += userComments.length;
            }
          });
        }
      }
    } catch (err) {
      console.error("Error loading activity stats:", err);
    }

    return { postsCount, commentsCount };
  }, [user]);

  const handleItemClick = (item) => {
    setOpenModal(item.id);
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
              {t("more.readingStatsDesc")}
            </p>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 w-full max-w-xs">
                  <div className="text-4xl font-black text-purple-600 mb-2 text-center">{readingStats.booksRead}</div>
                  <div className="text-sm text-gray-600 text-center">{t("more.booksRead")}</div>
                </div>
              </div>
            )}
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
              {t("more.activityOverviewDesc")}
            </p>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="text-lg font-bold text-indigo-600 mb-1">{t("more.postsCreated")}</div>
                  <div className="text-2xl font-black text-indigo-700">{activityStats.postsCount}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="text-lg font-bold text-purple-600 mb-1">{t("more.commentsWritten")}</div>
                  <div className="text-2xl font-black text-purple-700">{activityStats.commentsCount}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                  <div className="text-lg font-bold text-amber-600 mb-1">{t("more.reviewsWritten")}</div>
                  <div className="text-2xl font-black text-amber-700">{reviews.length}</div>
                </div>
              </div>
            )}
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
                {t("more.aboutTitle")}
              </div>
              <p className="text-lg text-gray-600">{t("more.version")}</p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-700 leading-relaxed">
                {t("more.aboutDescription")}
              </p>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <p className="text-sm text-gray-600">
                  {t("more.madeWithLove")}
                </p>
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
              {t("more.contactDescription")}
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                <div className="font-bold text-violet-600 mb-2">{t("more.email")}</div>
                <div className="text-gray-700">{t("more.emailAddress")}</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="font-bold text-purple-600 mb-2">{t("more.feedback")}</div>
                <div className="text-gray-700">{t("more.feedbackDescription")}</div>
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
    };
    return content[modalId] || null;
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5">
            <div className="relative">
              <div className="w-1.5 sm:w-2 h-16 sm:h-18 md:h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
              <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-16 sm:h-18 md:h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-2 sm:mb-3 drop-shadow-sm">
                {t("more.title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-base sm:text-lg md:text-xl lg:text-2xl mt-2 sm:mt-3 font-semibold">
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
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => handleItemClick(item)}
                    className="group relative p-4 sm:p-5 md:p-6 bg-white dark:bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-200 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] shadow-lg hover:shadow-xl text-left overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 dark:text-gray-900 group-hover:text-white transition-colors duration-300 mb-1 text-base sm:text-lg">
                            {item.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-600 group-hover:text-white/90 transition-colors duration-300">
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
