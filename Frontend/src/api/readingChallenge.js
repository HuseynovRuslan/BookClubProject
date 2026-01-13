import { apiRequest, USE_API_MOCKS, delay } from "./config";

export async function getUserYearChallenge(userId, year) {
  if (USE_API_MOCKS) {
    await delay(300);
    return {
      year: year || new Date().getFullYear(),
      targetBooksCount: 50,
      completedBooksCount: 23,
      books: [],
    };
  }
  
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  
  const response = await apiRequest(
    `/api/UserYearChallenge/${year || new Date().getFullYear()}?${params.toString()}`,
    { method: "GET" }
  );
  
  return response?.data || response?.Data || response;
}

export async function getAllUserYearChallenges(userId, year = null) {
  if (USE_API_MOCKS) {
    await delay(300);
    return {
      items: [
        {
          year: 2024,
          targetBooksCount: 50,
          completedBooksCount: 23,
        },
        {
          year: 2023,
          targetBooksCount: 40,
          completedBooksCount: 38,
        },
      ],
      total: 2,
    };
  }
  
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  if (year) params.append("year", year);
  params.append("PageNumber", 1);
  params.append("PageSize", 50); // Maximum allowed by backend
  
  const response = await apiRequest(
    `/api/UserYearChallenge?${params.toString()}`,
    { method: "GET" }
  );
  
  return response;
}

export async function upsertUserYearChallenge(targetBooksCount) {
  if (USE_API_MOCKS) {
    await delay(300);
    return {
      year: new Date().getFullYear(),
      targetBooksCount,
      completedBooksCount: 0,
    };
  }
  
  return apiRequest("/api/UserYearChallenge/upsert", {
    method: "POST",
    body: { targetBooksCount },
  });
}
