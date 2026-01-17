import { useState, useEffect } from 'react';
import { Trophy, Target, Edit3, Check, X, Loader, Sparkles, BookOpen } from 'lucide-react';
import { getUserYearChallenge, upsertUserYearChallenge } from '../api/readingChallenge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7050';

const ReadingChallengeCard = ({ year = new Date().getFullYear(), onUpdate }) => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTarget, setNewTarget] = useState(12); // Default goal suggestion

  useEffect(() => {
    if (user?.id) {
      fetchChallenge();
    }
  }, [user?.id, year]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const data = await getUserYearChallenge(year, user?.id);
      // data will be null if no challenge exists (404) - this is expected
      setChallenge(data);
      if (data) {
        setTargetInput(data.targetBooksCount?.toString() || '');
      }
    } catch (error) {
      // Only log unexpected errors (not 404s, which are handled in the API)
      if (error.response?.status !== 404) {
        console.error('Error fetching challenge:', error);
      }
      // Set challenge to null on any error to show empty state
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newTarget || newTarget < 1) {
      toast.error('Please enter a valid target (at least 1 book)');
      return;
    }

    try {
      setSaving(true);
      await upsertUserYearChallenge(parseInt(newTarget));
      toast.success(`${year} Reading Challenge started! 🎯`);
      setIsCreating(false);
      await fetchChallenge();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to create challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTarget = async () => {
    const target = parseInt(targetInput);
    if (!target || target < 1) {
      toast.error('Please enter a valid target');
      return;
    }

    try {
      setSaving(true);
      await upsertUserYearChallenge(target);
      toast.success('Challenge updated! 📚');
      setIsEditing(false);
      await fetchChallenge();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update challenge');
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const booksRead = challenge?.completedBooksCount || 0;
  const target = challenge?.targetBooksCount || 1;
  const progress = Math.min((booksRead / target) * 100, 100);
  const isCompleted = booksRead >= target;

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-stone-200 rounded-lg"></div>
          <div className="h-5 bg-stone-200 rounded w-32"></div>
        </div>
        <div className="h-3 bg-stone-200 rounded w-full mb-3"></div>
        <div className="h-8 bg-stone-200 rounded w-full"></div>
      </div>
    );
  }

  // No challenge - Show CTA to create one
  if (!challenge && !isCreating) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-stone-800">{year} Reading Challenge</h3>
        </div>

        <p className="text-stone-600 text-sm mb-4">
          Set your Reading Challenge for {year}! Track your progress and achieve your reading goals.
        </p>

        <button
          onClick={() => setIsCreating(true)}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start Your Challenge
        </button>
      </div>
    );
  }

  // Creating new challenge
  if (isCreating) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-stone-800">Set Your {year} Goal</h3>
        </div>

        <p className="text-stone-600 text-sm mb-4">
          How many books do you want to read this year?
        </p>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            min="1"
            max="365"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-amber-200 rounded-lg text-stone-900 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="12"
          />
          <span className="text-stone-600 font-medium">books</span>
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 mb-4">
          {[12, 24, 52].map((num) => (
            <button
              key={num}
              onClick={() => setNewTarget(num)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${parseInt(newTarget) === num
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-amber-200 text-stone-600 hover:bg-amber-50'
                }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(false)}
            className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChallenge}
            disabled={saving}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Active challenge
  return (
    <div className={`rounded-xl border p-5 ${isCompleted
      ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
      : 'bg-white border-stone-200'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
            <Trophy className={`w-5 h-5 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">{year} Challenge</h3>
            {isCompleted && (
              <span className="text-xs text-emerald-600 font-medium">Goal Reached! 🎉</span>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            title="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress section */}
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="365"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <span className="text-stone-500 text-sm">books</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setTargetInput(challenge?.targetBooksCount?.toString() || '');
              }}
              className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTarget}
              disabled={saving}
              className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress text */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isCompleted ? 'text-emerald-600' : 'text-stone-900'}`}>
                {booksRead}
              </span>
              <span className="text-stone-500">/ {target} books</span>
            </div>
            <span className={`text-sm font-semibold ${isCompleted ? 'text-emerald-600' : 'text-stone-500'}`}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Motivational text */}
          <p className="text-xs text-stone-500 mt-2">
            {isCompleted ? (
              <span className="text-emerald-600">
                Amazing! You've crushed your reading goal! 🏆
              </span>
            ) : booksRead === 0 ? (
              'Start reading to track your progress!'
            ) : target - booksRead === 1 ? (
              'Just 1 more book to go! You got this! 💪'
            ) : (
              `${target - booksRead} books to go. Keep reading! 📖`
            )}
          </p>

          {/* Grid of Books */}
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {/* Display read books */}
            {challenge?.books?.map((book) => {
              const imageUrl = book.coverImageUrl
                ? (book.coverImageUrl.startsWith('http')
                  ? book.coverImageUrl
                  : `${BASE_URL}${book.coverImageUrl}`)
                : null;

              return (
                <div key={book.bookId} className="aspect-[2/3] relative group">
                  <div className="w-full h-full rounded-md overflow-hidden border border-stone-200 bg-stone-100 shadow-sm transition-transform group-hover:scale-105">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = 'none'; // Hide broken image
                          e.target.nextSibling.style.display = 'flex'; // Show fallback
                        }}
                      />
                    ) : null}
                    {/* Fallback for when image is missing or errors out */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-stone-100 p-1 text-center"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <BookOpen className="w-5 h-5 text-stone-300" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                      <p className="text-[10px] text-white text-center line-clamp-3 leading-tight font-medium">
                        {book.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Display empty slots to fill up to target (limit to reasonable number if target is huge) */}
            {[...Array(Math.max(0, Math.min(target - booksRead, 12)))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-[2/3] rounded-md border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
                <span className="text-stone-300 font-bold text-lg opacity-50">{booksRead + i + 1}</span>
              </div>
            ))}

            {/* If there are more remaining books than we displayed slots for */}
            {target - booksRead > 12 && (
              <div className="aspect-[2/3] rounded-md border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
                <span className="text-stone-400 font-medium text-xs">+{target - booksRead - 12} more</span>
              </div>
            )}
          </div>
        </>
      )
      }
    </div >
  );
};

export default ReadingChallengeCard;
