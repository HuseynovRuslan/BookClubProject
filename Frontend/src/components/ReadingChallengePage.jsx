import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  getUserYearChallenge,
  getAllUserYearChallenges,
  upsertUserYearChallenge,
} from "../api/readingChallenge";
import {
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Plus,
  Edit2,
  CheckCircle2,
  Sparkles,
  Award,
  BarChart3,
} from "lucide-react";
import { getImageUrl } from "../api/config";

export default function ReadingChallengePage() {
  const { user } = useAuth();
  const t = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [challenge, setChallenge] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenge();
    loadAllChallenges();
  }, [selectedYear, user]);

  const loadChallenge = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getUserYearChallenge(user.id, selectedYear);
      setChallenge(data);
      setTargetInput(data?.targetBooksCount?.toString() || "");
    } catch (err) {
      // 404 means challenge doesn't exist yet - that's OK, show create form
      if (err.status === 404) {
        setChallenge(null);
        setTargetInput("");
      } else {
        setError(err.message || "Failed to load challenge");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllChallenges = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getAllUserYearChallenges(user.id);
      setAllChallenges(data?.items || data || []);
    } catch (err) {
      // Ignore errors for all challenges - it's not critical
      console.error("Failed to load all challenges:", err);
      setAllChallenges([]);
    }
  };

  const handleUpsertChallenge = async () => {
    if (!targetInput || isNaN(targetInput) || parseInt(targetInput) < 1) {
      setError("Please enter a valid target (minimum 1)");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await upsertUserYearChallenge(parseInt(targetInput));
      setIsEditing(false);
      await loadChallenge();
      await loadAllChallenges();
    } catch (err) {
      setError(err.message || "Failed to update challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = challenge
    ? Math.min((challenge.completedBooksCount / challenge.targetBooksCount) * 100, 100)
    : 0;

  const remainingBooks = challenge
    ? Math.max(challenge.targetBooksCount - challenge.completedBooksCount, 0)
    : 0;

  // Get all years from challenges + current year + only previous year (2025)
  const challengeYears = allChallenges.map(ch => ch.year);
  // Show current year (2026) + previous year (2025) + existing challenge years (even if older)
  const previousYear = currentYear - 1; // 2025
  const allYears = [...new Set([currentYear, previousYear, ...challengeYears])]
    .sort((a, b) => b - a);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border-2 border-amber-100 dark:border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 shadow-2xl">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_10%_20%,rgba(251,191,36,0.3),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(248,113,113,0.25),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(248,180,0,0.2),transparent_30%)]" />
        <div className="relative p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/80 shadow-lg border-2 border-amber-200 dark:border-amber-200">
                <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-600" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-gray-900 mb-2">
                  Reading Challenge
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-700 font-semibold">
                  Set your reading goals and track your progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-600" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-white border-2 border-amber-200 dark:border-amber-200 text-gray-900 dark:text-gray-900 font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 min-w-[120px]"
              >
                {allYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
            <div className="w-8 h-8 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute"></div>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-700">Loading challenge...</span>
          </div>
        </div>
      ) : error && !challenge ? (
        <div className="text-center py-20">
          <div className="inline-block p-8 bg-red-50 dark:bg-red-50 rounded-2xl border-2 border-red-200 dark:border-red-200 shadow-xl">
            <p className="text-red-600 dark:text-red-600 font-bold mb-4">{error}</p>
            <button
              onClick={loadChallenge}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Challenge Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Progress Card */}
            <div className="lg:col-span-2 bg-white dark:bg-white rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100">
                    <Target className="w-6 h-6 text-amber-600 dark:text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">
                      {selectedYear} Challenge
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-600">
                      Your reading progress
                    </p>
                  </div>
                </div>
                {!isEditing && challenge && selectedYear === currentYear && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-50 hover:bg-amber-100 dark:hover:bg-amber-100 text-amber-600 dark:text-amber-600 transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                      Target Books for {selectedYear}
                    </label>
                    <input
                      type="number"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      min="1"
                      className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-amber-200 dark:border-amber-200 text-gray-900 dark:text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200"
                      placeholder="Enter target number"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-50 border-2 border-red-200 dark:border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 dark:text-red-600 font-semibold">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpsertChallenge}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Save Challenge
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setTargetInput(challenge?.targetBooksCount?.toString() || "");
                      }}
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : challenge ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-black text-gray-900 dark:text-gray-900">
                        {challenge.completedBooksCount}
                      </span>
                      <span className="text-xl font-bold text-gray-600 dark:text-gray-600">
                        / {challenge.targetBooksCount} books
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-100 dark:bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-600">
                        {progressPercentage.toFixed(1)}% Complete
                      </span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-600">
                        {remainingBooks} books remaining
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 border-2 border-amber-200 dark:border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-600" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-700">
                          Completed
                        </span>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-900">
                        {challenge.completedBooksCount}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-50 dark:to-emerald-50 border-2 border-green-200 dark:border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-600" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-700">
                          On Track
                        </span>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-900">
                        {progressPercentage >= 50 ? "Yes" : "Keep Going"}
                      </p>
                    </div>
                  </div>
                </>
              ) : selectedYear !== currentYear ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 rounded-full mb-4">
                    <Calendar className="w-10 h-10 text-gray-600 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-900 mb-2">
                    No Challenge for {selectedYear}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-600 mb-6">
                    {selectedYear < currentYear 
                      ? `You didn't set a reading challenge for ${selectedYear}. You can only create challenges for the current year (${currentYear}).`
                      : `You can only create reading challenges for the current year (${currentYear}).`}
                  </p>
                  <button
                    onClick={() => setSelectedYear(currentYear)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Target className="w-5 h-5" />
                    Go to {currentYear} Challenge
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-4">
                    <Target className="w-10 h-10 text-amber-600 dark:text-amber-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-900 mb-2">
                    No Challenge Set
                  </h3>
                  <p className="text-gray-600 dark:text-gray-600 mb-6">
                    Set your reading goal for {selectedYear} to get started!
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Challenge
                  </button>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-white rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-100 dark:to-indigo-100">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-900">
                  All Time Stats
                </h3>
              </div>
              <div className="space-y-4">
                {allChallenges.length > 0 ? (
                  allChallenges.map((ch) => {
                    const chProgress = ch.completedBooksCount / ch.targetBooksCount;
                    return (
                      <div
                        key={ch.year}
                        className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-50 dark:to-gray-100 border-2 border-gray-200 dark:border-gray-200 hover:border-amber-300 dark:hover:border-amber-300 transition-all cursor-pointer"
                        onClick={() => setSelectedYear(ch.year)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 dark:text-gray-900">
                            {ch.year}
                          </span>
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-600">
                            {ch.completedBooksCount}/{ch.targetBooksCount}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(chProgress * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600 dark:text-gray-600 text-center py-4">
                    No challenges yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Books List */}
          {challenge && challenge.books && challenge.books.length > 0 && (
            <div className="bg-white dark:bg-white rounded-3xl p-8 border-2 border-gray-100 dark:border-gray-200 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-100 dark:to-cyan-100">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-900">
                  Completed Books ({challenge.completedBooksCount})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {challenge.books.map((book) => (
                  <div
                    key={book.bookId}
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {book.coverImageUrl ? (
                      <img
                        src={getImageUrl(book.coverImageUrl)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-amber-600 dark:text-amber-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-bold line-clamp-2">
                          {book.title}
                        </p>
                        <p className="text-white/80 text-xs line-clamp-1">
                          {book.authorName}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
