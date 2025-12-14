import { apiRequest } from "./config";

export async function getQuotes({ page = 1, pageSize = 20, query, sortColumn, sortOrder, tag, userId, authorId, bookId } = {}) {
  const params = new URLSearchParams();
  if (query) params.append("Query", query);
  if (sortColumn) params.append("SortColumn", sortColumn);
  if (sortOrder) params.append("SortOrder", sortOrder);
  if (page) params.append("PageNumber", page);
  if (pageSize) params.append("PageSize", pageSize);
  if (tag) params.append("Tag", tag);
  if (userId) params.append("UserId", userId);
  if (authorId) params.append("AuthorId", authorId);
  if (bookId) params.append("BookId", bookId);
  return apiRequest(`/api/Quotes/get-all-quotes?${params.toString()}`, { method: "GET" });
}

export async function getMyQuotes() {
  return apiRequest("/api/Quotes/get-my-quotes", { method: "GET" });
}

export async function getQuoteById(id) {
  return apiRequest(`/api/Quotes/get-quote-by-id/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createQuote(payload) {
  return apiRequest("/api/Quotes/create-quote", {
    method: "POST",
    body: payload,
  });
}

export async function updateQuote(id, payload) {
  // Try PascalCase first (common in .NET backends)
  const pascalCasePayload = {
    Text: payload.Text || payload.text || "",
    Tags: payload.Tags || payload.tags || null,
  };

  try {
    return await apiRequest(`/api/Quotes/update-quote/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: pascalCasePayload,
    });
  } catch (err) {
    // If PascalCase fails with 400, try camelCase
    if (err.status === 400) {
      console.log("PascalCase failed, trying camelCase:", err);
      const camelCasePayload = {
        text: payload.Text || payload.text || "",
        tags: payload.Tags || payload.tags || null,
      };
      return await apiRequest(`/api/Quotes/update-quote/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: camelCasePayload,
      });
    }
    throw err;
  }
}

export async function deleteQuote(id) {
  return apiRequest(`/api/Quotes/delete-quote/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function likeQuote(id) {
  return apiRequest(`/api/Quotes/toggle-quote-like/${encodeURIComponent(id)}`, {
    method: "POST",
  });
}


