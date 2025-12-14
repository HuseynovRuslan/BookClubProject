import { apiRequest, USE_API_MOCKS, delay, getEmailFromToken } from "./config";
import { loadMockAccount, saveMockAccount } from "./mockStorage";
import { loadMockShelves } from "./mockData";
import { loadMockReviews, ensureReviewHasBook } from "./mockData";

function accountToProfile(account) {
  return {
    id: account.id,
    name: `${account.name}${account.surname ? ` ${account.surname}` : ""
      }`.trim(),
    firstName: account.name,
    surname: account.surname,
    email: account.email,
    role: account.role,
    bio: account.bio,
    avatarUrl: account.avatarUrl || null,
  };
}

/**
 * Normalizes backend UserProfileDto to frontend profile format
 * Handles ApiResponse wrapper and field name variations (camelCase/PascalCase)
 */
function normalizeProfileDto(dto) {
  if (!dto) return null;
  
  // Handle ApiResponse wrapper - extract Data/data if present
  let profileData = dto;
  if (dto.Data !== undefined) {
    profileData = dto.Data;
  } else if (dto.data !== undefined) {
    profileData = dto.data;
  }
  
  console.log("normalizeProfileDto - raw profileData:", profileData);
  
  // Build full name from FirstName and LastName (handle both camelCase and PascalCase)
  const firstName = profileData.firstName || profileData.FirstName || "";
  const lastName = profileData.lastName || profileData.LastName || profileData.surname || profileData.Surname || "";
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`.trim();
  
  // Extract username - try all possible field names
  const username = profileData.username || 
                   profileData.Username || 
                   profileData.userName || 
                   profileData.UserName ||
                   profileData.user_name ||
                   profileData.User_Name ||
                   (profileData.email ? profileData.email.split("@")[0] : "") ||
                   "";
  
  // Get name field - prioritize username, then fullName, then profileData.name, then email prefix
  let name = "";
  
  // First priority: username (e.g., "9alii")
  if (username && username.trim() !== "" && username !== "User") {
    name = username;
  }
  // Second priority: fullName (firstName + lastName)
  else if (fullName && fullName.trim() !== "") {
    name = fullName;
  }
  // Third priority: existing name (if not "User")
  else if (profileData.name && profileData.name.trim() !== "" && profileData.name !== "User") {
    name = profileData.name;
  }
  // Fourth priority: Name (PascalCase)
  else if (profileData.Name && profileData.Name.trim() !== "" && profileData.Name !== "User") {
    name = profileData.Name;
  }
  // Fifth priority: email prefix
  else if (profileData.email && profileData.email.trim() !== "") {
    name = profileData.email.split("@")[0];
  }
  // Final fallback
  else {
    name = "User";
  }
  
  return {
    id: profileData.id || profileData.Id || "",
    name: name,
    firstName: firstName,
    surname: lastName,
    email: profileData.email || profileData.Email || "",
    role: profileData.role || profileData.Role || "reader",
    bio: profileData.bio || profileData.Bio || "",
    avatarUrl: profileData.avatarUrl || profileData.AvatarUrl || 
               profileData.profilePictureUrl || profileData.ProfilePictureUrl || null,
    username: username || (profileData.email ? profileData.email.split("@")[0] : "") || "",
  };
}

export async function getCurrentUserProfile() {
  if (USE_API_MOCKS) {
    await delay(200);
    const account = loadMockAccount();
    return accountToProfile(account);
  }
  const response = await apiRequest("/api/Users/get-current-user-profile", { method: "GET" });
  const profile = normalizeProfileDto(response);
  
  // If email is not in profile response, try to get it from JWT token
  if (profile && !profile.email) {
    const emailFromToken = getEmailFromToken();
    if (emailFromToken) {
      profile.email = emailFromToken;
    }
  }
  
  return profile;
}

export async function updateProfile(payload) {
  if (USE_API_MOCKS) {
    await delay(200);
    const account = loadMockAccount();
    const updated = {
      ...account,
      name: payload.name ?? payload.firstName ?? account.name,
      surname: payload.surname ?? payload.lastName ?? account.surname,
      bio: payload.bio ?? account.bio,
      role: payload.role ?? account.role,
    };
    saveMockAccount(updated);
    return accountToProfile(updated);
  }
  
  // Backend expects FirstName and LastName (not name and surname)
  // Note: email and role are not part of UpdateUserProfileCommand
  const backendPayload = {
    FirstName: payload.firstName || payload.name?.split(/\s+/)[0] || "",
    LastName: payload.lastName || payload.surname || payload.name?.split(/\s+/).slice(1).join(" ") || "",
    Bio: payload.bio || "",
  };
  
  await apiRequest("/api/Users/update-user-profile", {
    method: "PUT",
    body: backendPayload,
  });
  
  // Return updated profile by fetching it again
  return getCurrentUserProfile();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function updateProfilePicture(file) {
  if (USE_API_MOCKS) {
    const imageData = file ? await readFileAsDataUrl(file) : null;
    const account = loadMockAccount();
    const updated = {
      ...account,
      avatarUrl: imageData || account.avatarUrl,
    };
    saveMockAccount(updated);
    return accountToProfile(updated);
  }

  const formData = new FormData();
  formData.append("File", file);

  await apiRequest("/api/Users/update-profile-picture", {
    method: "PATCH",
    body: formData,
  });
  
  // Return updated profile by fetching it again
  return getCurrentUserProfile();
}

export async function deleteProfilePicture() {
  if (USE_API_MOCKS) {
    await delay(150);
    const account = loadMockAccount();
    const updated = { ...account, avatarUrl: null };
    saveMockAccount(updated);
    return accountToProfile(updated);
  }
  
  await apiRequest("/api/Users/delete-profile-picture", {
    method: "DELETE",
  });
  
  // Return updated profile by fetching it again
  return getCurrentUserProfile();
}

export async function getUserByUsername(username) {
  if (USE_API_MOCKS) {
    await delay(200);
    const account = loadMockAccount();
    if (account.email.split("@")[0] === username) {
      return accountToProfile(account);
    }
    throw new Error("Mock user not found");
  }
  
  try {
    const response = await apiRequest(`/api/Users/get-user-profile-by-username/${encodeURIComponent(username)}`, {
      method: "GET",
    });
    // rawRequest now returns null for 404 on user profile endpoints
    if (response === null) {
      return null;
    }
    return normalizeProfileDto(response);
  } catch (err) {
    // If endpoint doesn't exist (404), return null instead of throwing
    // Don't log 404 errors - they're expected when user doesn't exist
    if (err.status === 404) {
      // Endpoint doesn't exist or user not found - return null silently
      return null;
    }
    // For other errors, log and throw
    console.error("Error getting user by username:", err);
    throw err;
  }
}

export async function getUserById(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    const account = loadMockAccount();
    if (account.id === userId || account.id?.toString() === userId?.toString()) {
      return accountToProfile(account);
    }
    throw new Error("Mock user not found");
  }
  
  // Try different possible endpoint names
  try {
    const response = await apiRequest(`/api/Users/get-user-profile-by-id/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
    // rawRequest now returns null for 404 on user profile endpoints
    if (response === null) {
      return null;
    }
    return normalizeProfileDto(response);
  } catch (err) {
    // If endpoint doesn't exist (404), return null instead of throwing
    // Don't log 404 errors - they're expected when user doesn't exist
    if (err.status === 404) {
      // Endpoint doesn't exist or user not found - return null silently
      return null;
    }
    // For other errors, log and throw
    console.error("Error getting user by ID:", err);
    throw err;
  }
}

export async function searchUsers(query) {
  // Query boş olsa, heç bir nəticə qaytarmayın
  if (!query || !query.trim()) {
    return [];
  }
  
  if (USE_API_MOCKS) {
    await delay(150);
    const account = loadMockAccount();
    const searchLower = query.toLowerCase();
    const matches =
      account.name.toLowerCase().includes(searchLower) ||
      account.email.toLowerCase().includes(searchLower) ||
      (account.email?.split("@")[0] || "").toLowerCase().includes(searchLower)
        ? [accountToProfile(account)]
        : [];
    return matches;
  }
  
  // Request backend to filter out admin users
  // Note: Backend should ideally filter admin users, but we also filter on frontend for safety
  const response = await apiRequest(`/api/Users/get-all-users?searchTerm=${encodeURIComponent(query.trim())}`, {
    method: "GET",
  });
  
  console.log("searchUsers API response:", response);
  
  // Handle different response formats
  let users = [];
  if (response) {
    // Check if it's a PagedResult format
    if (response.items && Array.isArray(response.items)) {
      users = response.items;
    } else if (response.Items && Array.isArray(response.Items)) {
      users = response.Items;
    } else if (Array.isArray(response)) {
      users = response;
    } else if (response.data && Array.isArray(response.data)) {
      users = response.data;
    } else if (response.Data && Array.isArray(response.Data)) {
      users = response.Data;
    }
  }
  
  console.log("Extracted users array:", users);
  
  const searchLower = query.trim().toLowerCase();
  
  // Normalize each user to consistent format and filter by username/name
  return users
    .map(user => {
      const firstName = user.firstName || user.FirstName || "";
      const lastName = user.lastName || user.LastName || user.surname || user.Surname || "";
      const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`.trim();
      const username = user.username || user.Username || user.userName || user.UserName || user.email?.split("@")[0] || "";
      const name = fullName || user.name || user.Name || "";
      const role = user.role || user.Role || "reader";
      
      return {
        id: user.id || user.Id || user.userId || user.UserId,
        username: username,
        name: name,
        firstName: firstName,
        lastName: lastName,
        surname: lastName,
        email: user.email || user.Email || "",
        bio: user.bio || user.Bio || "",
        avatarUrl: user.avatarUrl || user.AvatarUrl || user.profilePictureUrl || user.ProfilePictureUrl || null,
        role: role,
      };
    })
    .filter(user => {
      // Filter out admin users (both frontend and backend should filter)
      // Check multiple possible role formats
      const role = user.role || user.Role || "";
      const roleLower = String(role).toLowerCase().trim();
      const isAdmin = roleLower === "admin" || role === "Admin" || role === "ADMIN";
      if (isAdmin) return false;
      
      // Filter: yalnız username və ya name-ə görə match edən userləri göstər
      const usernameMatch = user.username.toLowerCase().includes(searchLower);
      const nameMatch = user.name.toLowerCase().includes(searchLower);
      return usernameMatch || nameMatch;
    });
}

export async function getMyShelves() {
  if (USE_API_MOCKS) {
    await delay(200);
    return loadMockShelves();
  }
  // Backend PagedResult<ShelfDto> qaytarır: { items: [], totalCount: 0, pageNumber: 1, pageSize: 20 }
  const response = await apiRequest("/api/Users/get-current-user-shelves", { method: "GET" });

  // Handle PagedResult format
  let shelves = [];
  if (response) {
    // Check if it's a PagedResult object
    if (response.items && Array.isArray(response.items)) {
      shelves = response.items;
    } else if (response.Items && Array.isArray(response.Items)) {
      shelves = response.Items;
    } else if (Array.isArray(response)) {
      shelves = response;
    }
  }

  // Normalize field names (handle both camelCase and PascalCase from backend)
  return shelves.map(shelf => {
    // Determine isDefault from various possible field names
    const isDefault = shelf.isDefault !== undefined ? shelf.isDefault :
      (shelf.IsDefault !== undefined ? shelf.IsDefault : false);

    const normalizedShelf = {
      id: shelf.id || shelf.Id,
      name: shelf.name || shelf.Name,
      isDefault: isDefault,
      // Set type based on isDefault or existing type field
      type: isDefault ? 'default' : (shelf.type || shelf.Type || 'custom'),
      bookCount: shelf.bookCount || shelf.BookCount || 0,
      books: (shelf.books || shelf.Books || []).map(book => ({
        id: book.id || book.Id,
        title: book.title || book.Title,
        authorName: book.authorName || book.AuthorName || book.author || book.Author,
        coverImageUrl: book.coverImageUrl || book.CoverImageUrl || book.coverImage || book.CoverImage,
        averageRating: book.averageRating || book.AverageRating || book.rating || book.Rating,
        genres: book.genres || book.Genres || []
      }))
    };
    return normalizedShelf;
  });
}

export async function getMyReviews() {
  if (USE_API_MOCKS) {
    await delay(200);
    return loadMockReviews().map(ensureReviewHasBook);
  }
  const response = await apiRequest("/api/Users/get-current-user-reviews", { method: "GET" });
  
  // Handle PagedResult format
  let reviews = [];
  if (response) {
    if (response.items && Array.isArray(response.items)) {
      reviews = response.items;
    } else if (response.Items && Array.isArray(response.Items)) {
      reviews = response.Items;
    } else if (Array.isArray(response)) {
      reviews = response;
    }
  }
  
  // Normalize review format
  return reviews.map(review => ({
    id: review.id || review.Id,
    bookId: review.bookId || review.BookId,
    rating: review.rating || review.Rating || 0,
    text: review.reviewText || review.ReviewText || review.text || "",
    book: review.book || review.Book ? {
      id: review.book.id || review.Book.Id || review.bookId || review.BookId,
      title: review.book.title || review.Book.Title || review.bookTitle || review.BookTitle,
      coverImageUrl: review.book.coverImageUrl || review.Book.CoverImageUrl || review.bookCoverImageUrl || review.BookCoverImageUrl,
    } : null,
    createdAt: review.createdAt || review.CreatedAt,
    updatedAt: review.updatedAt || review.UpdatedAt,
  }));
}

export async function getMySocials() {
  if (USE_API_MOCKS) {
    await delay(200);
    return { facebook: "", twitter: "", instagram: "", website: "" };
  }
  return apiRequest("/api/Users/get-user-social-links", { method: "GET" });
}

async function mockChangePassword(payload) {
  await delay(500);
  // Simulate validation
  if (!payload.currentPassword || !payload.newPassword || !payload.confirmPassword) {
    throw new Error("Bütün sahələr doldurulmalıdır");
  }
  if (payload.newPassword.length < 6) {
    throw new Error("Yeni şifrə ən azı 6 simvol olmalıdır");
  }
  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error("Yeni şifrə və təsdiq şifrəsi uyğun gəlmir");
  }
  return { message: "Şifrə uğurla dəyişdirildi (mock mode)" };
}

export async function changePassword(payload) {
  if (USE_API_MOCKS) {
    return mockChangePassword(payload);
  }

  try {
    // Backend expects: { currentPassword, newPassword, confirmPassword }
    // Try PascalCase first (common in .NET backends)
    const backendPayload = {
      CurrentPassword: payload.currentPassword || payload.CurrentPassword || "",
      NewPassword: payload.newPassword || payload.NewPassword || "",
      ConfirmPassword: payload.confirmPassword || payload.ConfirmPassword || "",
    };

    console.log("Change password payload to backend:", backendPayload);

    try {
      return await apiRequest("/api/Users/change-password", {
        method: "POST",
        body: backendPayload,
      });
    } catch (err) {
      // If PascalCase fails with 400, try camelCase
      if (err.status === 400) {
        console.log("PascalCase failed, trying camelCase:", err);
        const camelCasePayload = {
          currentPassword: payload.currentPassword || "",
          newPassword: payload.newPassword || "",
          confirmPassword: payload.confirmPassword || "",
        };
        console.log("Change password payload (camelCase) to backend:", camelCasePayload);
        return await apiRequest("/api/Users/change-password", {
          method: "POST",
          body: camelCasePayload,
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}

