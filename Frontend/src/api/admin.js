import { apiRequest } from "./config";


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
  const formData = new FormData();
  
  if (bookData.title) formData.append("Title", bookData.title);
  if (bookData.description) formData.append("Description", bookData.description);
  if (bookData.isbn) formData.append("ISBN", bookData.isbn);
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
    headers: {}, 
  });
}

export async function updateBookAsAdmin(bookId, bookData) {
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
    headers: {},
  });
}

export async function deleteQuoteAsAdmin(quoteId) {
  return await apiRequest(`/api/Admin/quotes/${quoteId}`, {
    method: "DELETE",
  });
}

export async function updateQuoteAsAdmin(quoteId, quoteData) {
  return await apiRequest(`/api/Quotes/update-quote/${quoteId}`, {
    method: "PUT",
    body: {
      Text: quoteData.text || quoteData.Text,
      Tags: quoteData.tags || quoteData.Tags || [],
    },
  });
}

export async function deleteReviewAsAdmin(reviewId) {
  return await apiRequest(`/api/Admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

export async function updateReviewAsAdmin(reviewId, reviewData) {
  return await apiRequest(`/api/Reviews/update-review/${reviewId}`, {
    method: "PUT",
    body: {
      Rating: reviewData.rating || reviewData.Rating,
      ReviewText: reviewData.text || reviewData.ReviewText || reviewData.reviewText || "",
    },
  });
}

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

export async function createAuthorAsAdmin(authorData) {
  return await apiRequest("/api/Authors/action/create-author", {
    method: "POST",
    body: authorData,
    headers: {}, 
  });
}

export async function updateAuthorAsAdmin(authorId, authorData) {
  return await apiRequest("/api/Authors/action/update-author", {
    method: "PUT",
    body: authorData,
    headers: {}, 
  });
}

export async function deleteAuthorAsAdmin(authorId) {
  return await apiRequest(`/api/Authors/action/delete-author/${authorId}`, {
    method: "DELETE",
  });
}

export async function createGenreAsAdmin(genreData) {
  return await apiRequest("/api/Genres/create-genre", {
    method: "POST",
    body: genreData,
  });
}

export async function updateGenreAsAdmin(genreId, genreData) {
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

