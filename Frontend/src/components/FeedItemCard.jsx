import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Star,
  BookOpen,
  Quote,
  BookMarked,
  UserPlus,
  Clock,
} from 'lucide-react';
import { likeQuote, unlikeQuote } from '../api/feed';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Relative time formatter
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Star Rating Display
const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  );
};

// Activity Type Icon
const ActivityIcon = ({ type }) => {
  const iconMap = {
    Quote: { icon: Quote, color: 'text-purple-500', bg: 'bg-purple-50' },
    Review: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    BookAdded: { icon: BookMarked, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    Follow: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  };
  const config = iconMap[type] || iconMap.Quote;
  const Icon = config.icon;
  
  return (
    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
    </div>
  );
};

// User Avatar
const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  
  const profilePicUrl = getImageUrl(user?.profilePictureUrl);
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || '?';

  return (
    <Link
      to={`/user/${user?.username}`}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white font-semibold overflow-hidden hover:ring-2 hover:ring-stone-300 transition-all shrink-0`}
    >
      {profilePicUrl ? (
        <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </Link>
  );
};

// Book Cover Mini
const BookCoverMini = ({ book, size = 'sm', disableLink = false }) => {
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-22',
    lg: 'w-20 h-28',
  };
  
  const coverUrl = getImageUrl(book?.coverImageUrl);
  
  const content = coverUrl ? (
    <img src={coverUrl} alt={book?.title} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
      <BookOpen className="w-5 h-5 text-stone-400" />
    </div>
  );

  const className = `${sizeClasses[size]} rounded-md overflow-hidden bg-stone-100 shrink-0 shadow-sm hover:shadow-md transition-shadow`;

  if (disableLink) {
    return <div className={className}>{content}</div>;
  }
  
  return (
    <Link to={`/books/${book?.id}`} className={className}>
      {content}
    </Link>
  );
};

// Quote Activity Card
const QuoteContent = ({ item }) => {
  const [liked, setLiked] = useState(item.quote?.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.quote?.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikeQuote(item.quote.id);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeQuote(item.quote.id);
        setLikesCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {/* Quote Text */}
      <div className="relative pl-4 border-l-4 border-purple-300 bg-gradient-to-r from-purple-50/50 to-transparent py-3 pr-4 rounded-r-lg">
        <Quote className="absolute -left-3 -top-1 w-6 h-6 text-purple-300 fill-purple-100" />
        <p className="text-stone-700 italic leading-relaxed">"{item.quote?.text}"</p>
      </div>

      {/* Book Reference */}
      {item.book && (
        <Link
          to={`/books/${item.book.id}`}
          className="mt-3 flex items-center gap-3 p-2 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <BookCoverMini book={item.book} size="sm" disableLink />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{item.book.title}</p>
            <p className="text-xs text-stone-500">{item.book.authorName}</p>
          </div>
        </Link>
      )}

      {/* Tags */}
      {item.quote?.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.quote.tags.slice(0, 5).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

// Review Activity Card
const ReviewContent = ({ item }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="mt-3">
      {/* Book Info with Review */}
      <div className="flex gap-4">
        <BookCoverMini
          book={{
            id: item.review?.bookId,
            coverImageUrl: item.review?.bookCoverImageUrl,
            title: item.review?.bookTitle,
          }}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${item.review?.bookId}`}
            className="font-semibold text-stone-800 hover:text-amber-600 transition-colors"
          >
            {item.review?.bookTitle}
          </Link>
          <div className="mt-1">
            <StarRating rating={item.review?.rating || 0} />
          </div>
          {item.review?.reviewText && (
            <p className="mt-2 text-stone-600 text-sm leading-relaxed line-clamp-3">
              {item.review.reviewText}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

// Book Added Activity Card
const BookAddedContent = ({ item }) => {
  return (
    <div className="mt-3">
      {/* Action Description */}
      <p className="text-stone-600 mb-3">
        added{' '}
        <Link
          to={`/books/${item.book?.id}`}
          className="font-semibold text-stone-800 hover:text-emerald-600 transition-colors"
        >
          {item.book?.title}
        </Link>{' '}
        to{' '}
        <span className="font-medium text-emerald-600">{item.shelfName}</span>
      </p>

      {/* Book Card */}
      <Link
        to={`/books/${item.book?.id}`}
        className="flex gap-4 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
      >
        <BookCoverMini book={item.book} size="md" disableLink />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-800">{item.book?.title}</h4>
          <p className="text-sm text-stone-500 mt-0.5">{item.book?.authorName}</p>
          {item.book?.averageRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(item.book.averageRating)} />
              <span className="text-xs text-stone-400">
                {item.book.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};

// Main FeedItemCard Component
const FeedItemCard = ({ item }) => {
  const getActivityDescription = () => {
    switch (item.activityType) {
      case 'Quote':
        return 'shared a quote';
      case 'Review':
        return 'reviewed a book';
      case 'BookAdded':
        return null; // Description is in the content
      default:
        return 'shared an update';
    }
  };

  const renderContent = () => {
    switch (item.activityType) {
      case 'Quote':
        return <QuoteContent item={item} />;
      case 'Review':
        return <ReviewContent item={item} />;
      case 'BookAdded':
        return <BookAddedContent item={item} />;
      default:
        return null;
    }
  };

  return (
    <article className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <UserAvatar user={item.user} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/user/${item.user?.username}`}
                className="font-semibold text-stone-800 hover:text-stone-600 transition-colors"
              >
                {item.user?.firstName && item.user?.lastName
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : item.user?.username}
              </Link>
              {getActivityDescription() && (
                <span className="text-stone-500 text-sm">{getActivityDescription()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-400">{getRelativeTime(item.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActivityIcon type={item.activityType} />
            <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">{renderContent()}</div>
    </article>
  );
};

export default FeedItemCard;
