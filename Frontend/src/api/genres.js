import { apiRequest } from "./config";

export async function getGenres({ page = 1, pageSize = 20, query, sortColumn, sortOrder } = {}) {
  const params = new URLSearchParams();
  if (query) params.append("Query", query);
  if (sortColumn) params.append("SortColumn", sortColumn);
  if (sortOrder) params.append("SortOrder", sortOrder);
  if (page) params.append("PageNumber", page);
  if (pageSize) params.append("PageSize", pageSize);
  return apiRequest(`/api/Genres/get-all-genres?${params.toString()}`, { method: "GET" });
}

export async function getGenreById(id) {
  return apiRequest(`/api/Genres/get-genre-by-id/${encodeURIComponent(id)}`, { method: "GET" });
}



