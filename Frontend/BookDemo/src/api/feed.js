import { apiRequest, USE_API_MOCKS, delay } from "./config";
import mockBooks from "../components/mockBooks";
import {
  loadMockReviews,
  ensureReviewHasBook,
} from "./mockData";

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

      const normalized = {
        id: item.id || item.Id,
        type: item.activityType?.toLowerCase() || item.ActivityType?.toLowerCase() || 'review',
        username: item.user?.username || item.User?.Username || item.user?.userName || item.User?.UserName || 'Anonymous',
        timestamp: item.createdAt || item.CreatedAt ? new Date(item.createdAt || item.CreatedAt).toLocaleString() : 'Just now',
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
        console.log("Normalized review:", normalized);
      }
      // Handle Quote activity
      else if (item.quote || item.Quote) {
        const quote = item.quote || item.Quote;
        normalized.type = 'quote';
        normalized.bookTitle = quote.bookTitle || quote.BookTitle || quote.book?.title || quote.Book?.Title || '';
        normalized.bookCover = quote.book?.coverImageUrl || quote.Book?.CoverImageUrl || quote.bookCover || quote.BookCover || '';
        normalized.review = quote.text || quote.Text || quote.content || quote.Content || '';
        normalized.likes = quote.likesCount || quote.LikesCount || 0;
        normalized.quoteId = quote.id || quote.Id || normalized.id; // Quote ID for like API
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

