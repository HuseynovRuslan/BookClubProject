import { apiRequest, USE_API_MOCKS, delay } from "./config";

export async function updateReadingProgress(bookId, currentPage) {
  if (USE_API_MOCKS) {
    await delay(200);
    return {
      bookId,
      currentPage,
      updatedAt: new Date().toISOString(),
    };
  }
  
  // Backend expects PascalCase: BookId, CurrentPage
  return apiRequest("/api/ReadingProgress", {
    method: "POST",
    body: { BookId: bookId, CurrentPage: currentPage },
  });
}

export async function getReadingProgresses(page = 1, pageSize = 20) {
  if (USE_API_MOCKS) {
    await delay(300);
    return {
      items: [],
      total: 0,
      page,
      pageSize,
    };
  }
  
  const params = new URLSearchParams();
  params.append("PageNumber", page);
  params.append("PageSize", pageSize);
  
  const response = await apiRequest(
    `/api/ReadingProgress?${params.toString()}`,
    { method: "GET" }
  );
  
  return response;
}
