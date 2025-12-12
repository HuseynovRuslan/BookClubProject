import { apiRequest } from "./config";

/**
 * Admin API functions
 */

// Books Management
export async function getAllBooksForAdmin(parameters = {}) {
  const queryParams = new URLSearchParams();
  if (parameters.pageNumber) queryParams.append("pageNumber", parameters.pageNumber);
  if (parameters.pageSize) queryParams.append("pageSize", parameters.pageSize);
  if (parameters.searchTerm) queryParams.append("searchTerm", parameters.searchTerm);
  
  const queryString = queryParams.toString();
  const path = `/api/Admin/books${queryString ? `?${queryString}` : ""}`;
  
  return await apiRequest(path, {
    method: "GET",
  });
}

export async function deleteBookAsAdmin(bookId) {
  return await apiRequest(`/api/Admin/books/${bookId}`, {
    method: "DELETE",
  });
}

export async function createBookAsAdmin(bookData) {
  // Create FormData for file upload
  const formData = new FormData();
  
  // Required fields
  if (bookData.title) formData.append("Title", bookData.title);
  if (bookData.description) formData.append("Description", bookData.description);
  if (bookData.isbn) formData.append("ISBN", bookData.isbn);
  // PublicationDate is required by backend validation
  if (bookData.publicationDate) {
    formData.append("PublicationDate", bookData.publicationDate);
  }
  if (bookData.language) formData.append("Language", bookData.language);
  if (bookData.pageCount) formData.append("PageCount", bookData.pageCount.toString());
  if (bookData.publisher) formData.append("Publisher", bookData.publisher);
  if (bookData.authorId) formData.append("AuthorId", bookData.authorId);
  if (bookData.coverImage && bookData.coverImage instanceof File) {
    formData.append("CoverImage", bookData.coverImage);
  }
  
  return await apiRequest("/api/Books/create-book", {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type with boundary for FormData
  });
}

export async function updateBookAsAdmin(bookId, bookData) {
  // Create FormData for file upload
  const formData = new FormData();
  
  formData.append("Id", bookId);
  if (bookData.title) formData.append("Title", bookData.title);
  if (bookData.description) formData.append("Description", bookData.description);
  if (bookData.isbn) formData.append("ISBN", bookData.isbn);
  if (bookData.publicationDate) formData.append("PublicationDate", bookData.publicationDate);
  if (bookData.language) formData.append("Language", bookData.language);
  if (bookData.pageCount) formData.append("PageCount", bookData.pageCount.toString());
  if (bookData.publisher) formData.append("Publisher", bookData.publisher);
  if (bookData.authorId) formData.append("AuthorId", bookData.authorId);
  if (bookData.coverImage && bookData.coverImage instanceof File) {
    formData.append("CoverImage", bookData.coverImage);
  }
  
  return await apiRequest("/api/Books/update-book", {
    method: "PUT",
    body: formData,
    headers: {}, // Let browser set Content-Type with boundary for FormData
  });
}

// Content Moderation - Quotes
export async function deleteQuoteAsAdmin(quoteId) {
  return await apiRequest(`/api/Admin/quotes/${quoteId}`, {
    method: "DELETE",
  });
}

// Content Moderation - Update Quote
export async function updateQuoteAsAdmin(quoteId, quoteData) {
  return await apiRequest(`/api/Quotes/update-quote/${quoteId}`, {
    method: "PUT",
    body: {
      Text: quoteData.text || quoteData.Text,
      Tags: quoteData.tags || quoteData.Tags || [],
    },
  });
}

// Content Moderation - Reviews
export async function deleteReviewAsAdmin(reviewId) {
  return await apiRequest(`/api/Admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

// Content Moderation - Update Review
export async function updateReviewAsAdmin(reviewId, reviewData) {
  return await apiRequest(`/api/Reviews/update-review/${reviewId}`, {
    method: "PUT",
    body: {
      Rating: reviewData.rating || reviewData.Rating,
      ReviewText: reviewData.text || reviewData.ReviewText || reviewData.reviewText || "",
    },
  });
}

// Users Management
export async function getAllUsersForAdmin(parameters = {}) {
  const queryParams = new URLSearchParams();
  if (parameters.pageNumber) queryParams.append("PageNumber", parameters.pageNumber);
  if (parameters.pageSize) queryParams.append("PageSize", parameters.pageSize);
  if (parameters.query) queryParams.append("Query", parameters.query);
  if (parameters.sortColumn) queryParams.append("SortColumn", parameters.sortColumn);
  if (parameters.sortOrder) queryParams.append("SortOrder", parameters.sortOrder);
  
  const queryString = queryParams.toString();
  const path = `/api/Users/get-all-users${queryString ? `?${queryString}` : ""}`;
  
  return await apiRequest(path, {
    method: "GET",
  });
}

// Authors Management
export async function createAuthorAsAdmin(authorData) {
  return await apiRequest("/api/Authors/action/create-author", {
    method: "POST",
    body: authorData,
    headers: {}, // Let browser set Content-Type with boundary for FormData
  });
}

export async function updateAuthorAsAdmin(authorId, authorData) {
  return await apiRequest("/api/Authors/action/update-author", {
    method: "PUT",
    body: authorData,
    headers: {}, // Let browser set Content-Type with boundary for FormData
  });
}

export async function deleteAuthorAsAdmin(authorId) {
  return await apiRequest(`/api/Authors/action/delete-author/${authorId}`, {
    method: "DELETE",
  });
}

// Genres Management
export async function createGenreAsAdmin(genreData) {
  return await apiRequest("/api/Genres/create-genre", {
    method: "POST",
    body: genreData,
  });
}

export async function updateGenreAsAdmin(genreId, genreData) {
  // UpdateGenreCommand requires Id in the body
  const updateData = {
    Id: genreId,
    Name: genreData.Name,
  };
  return await apiRequest("/api/Genres/update-genre", {
    method: "PUT",
    body: updateData,
  });
}

export async function deleteGenreAsAdmin(genreId) {
  return await apiRequest(`/api/Genres/delete-genre/${genreId}`, {
    method: "DELETE",
  });
}

