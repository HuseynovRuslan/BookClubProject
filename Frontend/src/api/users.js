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
  
  // Build full name from FirstName and LastName (handle both camelCase and PascalCase)
  const firstName = profileData.firstName || profileData.FirstName || "";
  const lastName = profileData.lastName || profileData.LastName || "";
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`.trim();
  
  return {
    id: profileData.id || profileData.Id || "",
    name: fullName || profileData.name || "",
    firstName: firstName,
    surname: lastName,
    email: profileData.email || profileData.Email || "",
    role: profileData.role || profileData.Role || "reader",
    bio: profileData.bio || profileData.Bio || "",
    avatarUrl: profileData.avatarUrl || profileData.AvatarUrl || 
               profileData.profilePictureUrl || profileData.ProfilePictureUrl || null,
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
  return apiRequest(`/api/Users/get-user-profile-by-username/${encodeURIComponent(username)}`, {
    method: "GET",
  });
}

export async function searchUsers(query) {
  if (USE_API_MOCKS) {
    await delay(150);
    const account = loadMockAccount();
    const matches =
      !query ||
        account.name.toLowerCase().includes(query.toLowerCase()) ||
        account.email.toLowerCase().includes(query.toLowerCase())
        ? [accountToProfile(account)]
        : [];
    return matches;
  }
  return apiRequest(`/api/Users/get-all-users?seachTerm=${encodeURIComponent(query)}`, {
    method: "GET",
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

