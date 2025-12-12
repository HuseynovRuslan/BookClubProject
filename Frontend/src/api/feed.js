import { apiRequest, USE_API_MOCKS, delay } from "./config";
import mockBooks from "../components/mockBooks";
import {
  loadMockReviews,
  ensureReviewHasBook,
} from "./mockData";
import { formatTimestamp } from "../utils/formatTimestamp";

function buildMockFeed({ page, pageSize }) {
  const bookPosts = mockBooks.map((book, index) => ({
    id: `mock-post-${index + 1}`,
    type: "post",
    username: index % 2 === 0 ? "Demo Reader" : "BookVerse Writer",
    bookTitle: book.title,
    bookCover: book.coverImage,
    review:
      book.description?.slice(0, 120) ||
      "Really enjoying this book in the mock social feed!",
    likes: 5 + index,
    comments: [],
    timestamp: "Just now",
  }));

  const reviewPosts = loadMockReviews().map(ensureReviewHasBook).map((review) => ({
    id: review.id,
    type: "review",
    username: "Community Reviewer",
    bookTitle: review.book?.title,
    bookCover: review.book?.coverImage,
    review: review.text,
    rating: review.rating,
    reviewId: review.id,
    likes: 12,
    comments: [],
    timestamp: "Today",
  }));

  const combined = [...reviewPosts, ...bookPosts];
  combined.sort(() => Math.random() - 0.5);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = combined.slice(start, end);

  return {
    items,
    total: combined.length,
    page,
    pageSize,
  };
}

export async function getFeed({ page = 1, pageSize = 20 } = {}) {
  if (USE_API_MOCKS) {
    await delay(300);
    return buildMockFeed({ page, pageSize });
  }

  // Backend maksimum pageSize: 50 qəbul edir
  const validPageSize = Math.min(Math.max(1, pageSize), 50);

  const params = new URLSearchParams();
  params.append("pageNumber", page.toString());
  params.append("pageSize", validPageSize.toString());

  const response = await apiRequest(`/api/Feed/get-feed?${params.toString()}`, { method: "GET" });

  // Backend returns PagedResult<FeedItemDto>
  // Normalize FeedItemDto to frontend format
  let items = [];
  if (response) {
    const rawItems = response.items || response.Items || [];
    items = rawItems.map(item => {
      // Backend format: { id, activityType, createdAt, user, quote, review, book, shelfName }
      // Frontend format: { id, type, username, bookTitle, bookCover, review, rating, reviewId, likes, comments, timestamp }

      const rawUserAvatar = item.user?.avatarUrl || item.User?.AvatarUrl || item.user?.profilePictureUrl || item.User?.ProfilePictureUrl || item.user?.avatar || item.User?.Avatar || null;
      
      const normalized = {
        id: item.id || item.Id,
        type: item.activityType?.toLowerCase() || item.ActivityType?.toLowerCase() || 'review',
        username: item.user?.username || item.User?.Username || item.user?.userName || item.User?.UserName || 'Anonymous',
        userAvatar: rawUserAvatar,
        timestamp: formatTimestamp(item.createdAt || item.CreatedAt),
        likes: 0, // Backend-də likes yoxdur, default 0
        comments: [], // Backend-də comments yoxdur, default []
      };

      // Handle Review activity
      if (item.review || item.Review) {
        const review = item.review || item.Review;
        normalized.type = 'review';
        // Backend BookReviewDto format: { id, bookId, bookTitle, bookCoverImageUrl, userId, username, rating, reviewText, createdAt }
        normalized.bookTitle = review.bookTitle || review.BookTitle || '';
        normalized.bookCover = review.bookCoverImageUrl || review.BookCoverImageUrl || review.book?.coverImageUrl || review.Book?.CoverImageUrl || review.bookCover || review.BookCover || '';
        normalized.review = review.reviewText || review.ReviewText || review.text || review.Text || '';
        normalized.rating = review.rating || review.Rating || 0;
        normalized.reviewId = review.id || review.Id || normalized.id;
        // Username already set from item.user, but review might have its own username
        if (review.username || review.Username) {
          normalized.username = review.username || review.Username;
        }
        // Review might have user avatar
        if (review.userAvatar || review.UserAvatar || review.user?.avatarUrl || review.User?.AvatarUrl) {
          normalized.userAvatar = review.userAvatar || review.UserAvatar || review.user?.avatarUrl || review.User?.AvatarUrl;
        }
        console.log("Normalized review:", normalized);
      }
      // Handle Quote activity
      else if (item.quote || item.Quote) {
        const quote = item.quote || item.Quote;
        const book = item.book || item.Book; // Book info from FeedItemDto
        normalized.type = 'quote';
        normalized.bookTitle = book?.title || book?.Title || quote.bookTitle || quote.BookTitle || quote.book?.title || quote.Book?.Title || '';
        normalized.bookCover = book?.coverImageUrl || book?.CoverImageUrl || quote.book?.coverImageUrl || quote.Book?.CoverImageUrl || quote.bookCover || quote.BookCover || '';
        normalized.review = quote.text || quote.Text || quote.content || quote.Content || '';
        normalized.likes = quote.likesCount || quote.LikesCount || 0;
        
        // Extract bookAuthor from book object (BookDto has AuthorName field)
        // Priority: book.AuthorName (from BookDto) > book.author.name > other sources
        normalized.bookAuthor = book?.authorName || 
                                book?.AuthorName ||
                                book?.author?.name ||
                                book?.Author?.Name ||
                                quote.book?.author?.name || 
                                quote.Book?.Author?.Name ||
                                quote.book?.authorName || 
                                quote.Book?.AuthorName ||
                                quote.author?.name ||
                                quote.Author?.Name ||
                                quote.bookAuthor ||
                                quote.BookAuthor ||
                                '';
        
        // Extract quoteId properly - ensure it's a string
        // Backend returns QuoteDto with Id field (capital I)
        let quoteIdValue = quote.Id || quote.id || quote.quoteId || quote.QuoteId || normalized.id;
        
        // If quoteId is still an object, try to extract from it
        if (quoteIdValue && typeof quoteIdValue !== 'string') {
          quoteIdValue = quoteIdValue.Id || quoteIdValue.id || quoteIdValue.quoteId || quoteIdValue.QuoteId || String(quoteIdValue);
        }
        
        // Final check - ensure it's a string
        normalized.quoteId = quoteIdValue ? String(quoteIdValue).trim() : null;
        // Quote might have user avatar
        if (quote.userAvatar || quote.UserAvatar || quote.user?.avatarUrl || quote.User?.AvatarUrl) {
          normalized.userAvatar = quote.userAvatar || quote.UserAvatar || quote.user?.avatarUrl || quote.User?.AvatarUrl;
        }
      }
      // Handle BookAdded activity
      else if (item.book || item.Book) {
        const book = item.book || item.Book;
        normalized.type = 'post';
        normalized.bookTitle = book.title || book.Title || '';
        normalized.bookCover = book.coverImageUrl || book.CoverImageUrl || book.coverImage || book.CoverImage || '';
        normalized.review = `Added to ${item.shelfName || item.ShelfName || 'shelf'}`;
      }

      return normalized;
    });
  }

  return {
    items,
    total: response?.totalCount || response?.TotalCount || items.length,
    page: response?.pageNumber || response?.PageNumber || page,
    pageSize: response?.pageSize || response?.PageSize || validPageSize,
  };
}

