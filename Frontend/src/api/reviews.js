import { apiRequest, USE_API_MOCKS, delay } from "./config";
import {
  loadMockReviews,
  saveMockReviews,
  generateId,
  ensureReviewHasBook,
} from "./mockData";

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
  };
}

export async function getReviews({ page = 1, pageSize = 20, bookId = null, userId = null } = {}) {
  if (USE_API_MOCKS) {
    await delay(200);
    const reviews = loadMockReviews().map(ensureReviewHasBook);
    return paginate(reviews, page, pageSize);
  }

  // Backend maksimum pageSize: 50 qəbul edir
  const validPageSize = Math.min(Math.max(1, pageSize), 50);

  // Build query parameters
  const params = new URLSearchParams();
  params.append("pageNumber", page.toString());
  params.append("pageSize", validPageSize.toString());
  if (bookId) params.append("bookId", bookId);
  if (userId) params.append("userId", userId);

  const response = await apiRequest(`/api/Reviews/get-all-reviews?${params.toString()}`, { method: "GET" });
  // Backend returns PagedResult<BookReviewDto>
  return response;
}

export async function getReviewById(id) {
  if (USE_API_MOCKS) {
    await delay(150);
    const review = loadMockReviews().find((item) => item.id === id);
    if (!review) {
      throw new Error("Review not found");
    }
    return ensureReviewHasBook(review);
  }
  return apiRequest(`/api/Reviews/get-review-by-id/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createReview(payload) {
  if (USE_API_MOCKS) {
    await delay(250);
    const newReview = {
      id: generateId("review"),
      bookId: payload.bookId,
      rating: payload.rating,
      text: payload.text || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newReview, ...loadMockReviews()];
    saveMockReviews(next);
    return ensureReviewHasBook(newReview);
  }
  // Backend expects ReviewText field, not text
  const backendPayload = {
    BookId: payload.bookId || payload.BookId,
    Rating: payload.rating || payload.Rating,
    ReviewText: payload.text || payload.ReviewText || payload.reviewText || "",
  };
  try {
    return await apiRequest("/api/Reviews/create-book-review", {
      method: "POST",
      body: backendPayload,
    });
  } catch (err) {
    // Handle 409 Conflict - user already reviewed this book
    if (err.status === 409) {
      const errorMessage = err.data?.errorMessages?.[0] || 
                          err.data?.message || 
                          err.message || 
                          "You have already reviewed this book. You can update your existing review instead.";
      const conflictError = new Error(errorMessage);
      conflictError.status = 409;
      conflictError.isConflict = true;
      throw conflictError;
    }
    throw err;
  }
}

export async function updateReview(id, payload) {
  if (USE_API_MOCKS) {
    await delay(200);
    const next = loadMockReviews().map((review) =>
      review.id === id
        ? {
          ...review,
          rating: payload.rating ?? review.rating,
          text: payload.text ?? review.text,
          updatedAt: new Date().toISOString(),
        }
        : review
    );
    saveMockReviews(next);
    const updated = next.find((review) => review.id === id);
    return ensureReviewHasBook(updated);
  }
  // Backend expects ReviewText field, not text
  const backendPayload = {
    Rating: payload.rating || payload.Rating,
    ReviewText: payload.text || payload.ReviewText || payload.reviewText || "",
  };
  return apiRequest(`/api/Reviews/update-review/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: backendPayload,
  });
}

export async function deleteReview(id) {
  if (USE_API_MOCKS) {
    await delay(150);
    const remaining = loadMockReviews().filter((review) => review.id !== id);
    saveMockReviews(remaining);
    return { id };
  }
  return apiRequest(`/api/Reviews/delete-review/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

