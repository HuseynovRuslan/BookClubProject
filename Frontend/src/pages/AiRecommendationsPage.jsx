import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAiRecommendations } from '../api/ai';
import { createFeedback } from '../api/feedback';
import { Sparkles, Brain, Loader2, BookOpen, Send, ExternalLink, PlusCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const AiRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [requestedBooks, setRequestedBooks] = useState(new Set());

  // Auto-load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (query = null) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const data = await getAiRecommendations(query);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      toast.error('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = (e) => {
    e.preventDefault();
    if (userQuery.trim()) {
      fetchRecommendations(userQuery.trim());
    } else {
      fetchRecommendations();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Your Personal AI Librarian
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Based on your reading history, I picked these books just for you
          </p>

          {/* Search Bar */}
          <form onSubmit={handleAskAI} className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Tell me what you're in the mood for... (e.g., 'Cyberpunk with detective elements')"
                  className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="m-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Ask AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Brain className="w-24 h-24 text-purple-600 dark:text-purple-400 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            </div>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 font-medium">
              Reading your literary DNA...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Finding the perfect books for you
            </p>
          </div>
        )}

        {/* Results Display */}
        {!loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((book, index) => (
              <BookCard
                key={index}
                book={book}
                index={index}
                isRequested={requestedBooks.has(index)}
                onRequestAdd={async () => {
                  try {
                    await createFeedback(
                      'Book Request',
                      `Please add the book: ${book.title} by ${book.author} (Recommended by AI).`
                    );
                    setRequestedBooks(prev => new Set([...prev, index]));
                    toast.success('Request sent to Admin!');
                  } catch (error) {
                    console.error('Error sending book request:', error);
                    toast.error('Failed to send request. Please try again.');
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && recommendations.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start reading books and rating them to get personalized recommendations, or type a query above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookCard = ({ book, index, isRequested, onRequestAdd }) => {
  const [imageError, setImageError] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleRequestAdd = async () => {
    setRequesting(true);
    await onRequestAdd();
    setRequesting(false);
  };

  // Use DB cover image if available, otherwise use coverImageUrl (for backward compatibility)
  const coverImage = book.coverImage || book.coverImageUrl;

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0
      }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6">
        {/* Book Cover */}
        <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700 aspect-[2/3]">
          {!imageError && coverImage ? (
            <img
              src={coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* AI Badge */}
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Pick
          </div>

          {/* In Library Badge */}
          {book.existsInDb && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              In Library
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {book.author}
          </p>
        </div>

        {/* The "Why" - Most Important Part */}
        <div className="relative mb-4">
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 pl-5">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">
                Why this book?
              </p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{book.reason}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {book.existsInDb ? (
            <Link
              to={`/books/${book.bookId}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              View Book
            </Link>
          ) : isRequested ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-xl font-semibold cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Requested
            </button>
          ) : (
            <button
              onClick={handleRequestAdd}
              disabled={requesting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Request to Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

export default AiRecommendationsPage;
