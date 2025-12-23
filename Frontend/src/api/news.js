import { apiRequest } from "./config";

/**
 * Fetches news from backend.
 * Uses /api/News endpoint (swagger). Some backends do not support query filters,
 * so we keep the call simple and filter on the client.
 */
export async function getNews() {
  const result = await apiRequest(`/api/News`, { method: "GET" });

  // Normalize common response shapes
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}


