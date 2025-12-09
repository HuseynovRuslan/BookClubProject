import { apiRequest } from "./config";

export async function getAuthors({ page = 1, pageSize = 20, query, sortColumn, sortOrder } = {}) {
  const params = new URLSearchParams();
  if (query) params.append("Query", query);
  if (sortColumn) params.append("SortColumn", sortColumn);
  if (sortOrder) params.append("SortOrder", sortOrder);
  if (page) params.append("PageNumber", page);
  if (pageSize) params.append("PageSize", pageSize);
  return apiRequest(`/api/Authors?${params.toString()}`, { method: "GET" });
}

export async function getAuthorById(id) {
  return apiRequest(`/api/Authors/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function getAuthorBooks(authorId) {
  return apiRequest(`/api/Authors/${encodeURIComponent(authorId)}/books`, { method: "GET" });
}

export async function createAuthor(payload) {
  const formData = new FormData();
  if (payload.Name) formData.append("Name", payload.Name);
  if (payload.Bio) formData.append("Bio", payload.Bio);
  if (payload.ProfilePicture) formData.append("ProfilePicture", payload.ProfilePicture);
  
  return apiRequest("/api/Authors", {
    method: "POST",
    body: formData,
  });
}


