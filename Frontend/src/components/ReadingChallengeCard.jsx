import { useState, useEffect } from 'react';
import { Trophy, Target, Edit3, Check, X, Loader, Sparkles, BookOpen } from 'lucide-react';
import { getUserYearChallenge, upsertUserYearChallenge } from '../api/readingChallenge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
      setChallenge(data);
      if (data) {
        setTargetInput(data.targetBooksCount?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
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
          Set a reading goal and track your progress throughout the year!
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
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                parseInt(newTarget) === num
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
    <div className={`rounded-xl border p-5 ${
      isCompleted 
        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
        : 'bg-white border-stone-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isCompleted ? 'bg-emerald-100' : 'bg-amber-100'
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
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted 
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
        </>
      )}
    </div>
  );
};

export default ReadingChallengeCard;
