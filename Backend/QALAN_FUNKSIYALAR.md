# Qalan Funksiyalar - Detallı Müqayisə

## ✅ TAM OLAN CONTROLLER-LƏR

### 1. **AuthController**
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ POST /api/auth/refresh
- ✅ POST /api/auth/logout
- ✅ GET /api/auth/confirm-email
- ❌ POST /api/auth/reset-confirmation-email (comment-dədir)
- ❌ POST /api/auth/forgot-password (comment-dədir, amma yazılıb)
- ❌ POST /api/auth/reset-password (comment-dədir, amma yazılıb)

### 2. **GenresController**
- ✅ GET /api/genres
- ✅ GET /api/genres/{id}
- ✅ POST /api/genres
- ✅ PUT /api/genres
- ✅ DELETE /api/genres/{id}

### 3. **ShelvesController**
- ✅ GET /api/shelves/{id}
- ✅ POST /api/shelves
- ✅ PUT /api/shelves
- ✅ DELETE /api/shelves/{id}
- ✅ POST /api/shelves/{shelfId}/books/{bookId}
- ✅ DELETE /api/shelves/{shelfId}/books/{bookId}

### 4. **ReviewsController**
- ✅ GET /api/reviews/{id}
- ✅ POST /api/reviews
- ✅ PUT /api/reviews/{reviewId}
- ✅ DELETE /api/reviews/{reviewId}

### 5. **QuotesController**
- ✅ GET /api/quotes
- ✅ GET /api/quotes/me
- ✅ GET /api/quotes/{id}
- ✅ POST /api/quotes
- ✅ POST /api/quotes/{id}/like
- ✅ PUT /api/quotes/{id}
- ✅ DELETE /api/quotes/{id}

### 6. **UserFollowsController**
- ✅ POST /api/user-follows/follow
- ✅ POST /api/user-follows/unfollow
- ✅ GET /api/user-follows/followers
- ✅ GET /api/user-follows/following

### 7. **AuthorsController**
- ✅ GET /api/authors
- ✅ GET /api/authors/{id}
- ✅ POST /api/authors
- ✅ PUT /api/authors
- ✅ DELETE /api/authors/{id}
- ✅ GET /api/authors/{authorId}/books

---

## ⚠️ QISMƏN OLAN CONTROLLER-LƏR

### 8. **UsersController**
**Olub:**
- ✅ GET /api/users/me
- ✅ GET /api/users/me/socials
- ✅ PUT /api/users/me/socials
- ✅ PUT /api/users/me
- ✅ PATCH /api/users/me/profile-picture
- ✅ DELETE /api/users/me/profile-picture
- ✅ GET /api/users/{username}
- ✅ GET /api/users/search
- ✅ GET /api/users/me/shelves
- ✅ GET /api/users/me/reviews

**Qalıb:**
- ❌ DELETE /api/users/me (DeleteAccount - comment-dədir)
- ❌ POST /api/users/me/change-password (ChangePassword - comment-dədir)
- ❌ GET /api/users/{userId}/shelves (comment-dədir)
- ❌ GET /api/users/me/yearlychallenges (UserYearChallenge - comment-dədir)
- ❌ GET /api/users/me/yearlychallenges/{year} (UserYearChallenge - comment-dədir)
- ❌ GET /api/users/{userId}/reviews (comment-dədir)

### 9. **BooksController**
**Olub:**
- ✅ GET /api/books
- ✅ GET /api/books/{id}
- ✅ POST /api/books/{bookId}/status

**Qalıb:**
- ❌ POST /api/books (CreateBook - comment-dədir)
- ❌ PUT /api/books (UpdateBook - comment-dədir)
- ❌ DELETE /api/books/{id} (DeleteBook - comment-dədir)
- ❌ POST /api/books/{bookId}/genres (AddGenresToBook - comment-dədir)
- ❌ DELETE /api/books/{bookId}/genres/{genreId} (RemoveGenreFromBook - comment-dədir)
- ❌ GET /api/books/by-genre (GetBooksByGenre - comment-dədir)
- ❌ GET /api/books/{bookId}/reviews (GetBookReviews - comment-dədir)

---

## ❌ TAMAMEN QALAN CONTROLLER-LƏR

### 10. **AuthorClaimRequestsController** - YOXDUR
**Endpoint-lər:**
- ❌ POST /api/author-claims/request (Müəllif iddiası göndər - User)
- ❌ PUT /api/author-claims/review (İddianı nəzərdən keçir - Admin)
- ❌ GET /api/author-claims (Bütün iddiaları gətir - Admin)

**Lazım olan:**
- Entity: `AuthorClaimRequest`
- Commands: `RequestAuthorClaim`, `ReviewAuthorClaim`
- Queries: `GetAllAuthorClaimRequests`
- Controller yaratmaq
- DbContext-ə əlavə etmək
- Migration yaratmaq

---

### 11. **ReadingProgressController** - YOXDUR
**Endpoint-lər:**
- ❌ POST /api/reading-progress (Oxuma proqresini yenilə - User)
- ❌ GET /api/reading-progress (İstifadəçinin oxuma proqreslərini gətir - User)

**Lazım olan:**
- Entity: `ReadingProgress`
- Commands: `UpdateReadingProgress`
- Queries: `GetReadingProgresses`
- Controller yaratmaq
- DbContext-ə əlavə etmək
- Migration yaratmaq

---

### 12. **UserYearChallengeController** - YOXDUR
**Endpoint-lər:**
- ❌ GET /api/user-year-challenge/{year} (Müəyyən il üçün challenge detalları - User)
- ❌ GET /api/user-year-challenge (Bütün challenge-ləri gətir - User)
- ❌ POST /api/user-year-challenge/upsert (Challenge yarat və ya yenilə - User)

**Lazım olan:**
- Entity: `UserYearChallenge`
- Commands: `UpsertUserYearChallenge`
- Queries: `GetUserYearChallenge`, `GetAllUserYearChallenges`
- Controller yaratmaq
- DbContext-ə əlavə etmək
- Migration yaratmaq
- `CreateReview` və `UpdateBookStatus` handler-lərində challenge yeniləməni aktivləşdirmək

---

## 📊 ÜMUMİ STATİSTİKA

### Controller-lər:
- **Tam olan:** 7 controller
- **Qismən olan:** 2 controller (UsersController, BooksController)
- **Tamamən qalan:** 3 controller (AuthorClaimRequests, ReadingProgress, UserYearChallenge)

### Endpoint-lər:
- **Tam olan:** ~45 endpoint
- **Comment-də olan:** ~15 endpoint
- **Tamamən qalan:** ~8 endpoint

### Əsas Qalan Funksiyalar:

1. **AuthorClaimRequestsController** - Tam yeni controller
2. **ReadingProgressController** - Tam yeni controller
3. **UserYearChallengeController** - Tam yeni controller
4. **AuthController** - ResetEmailConfirmation, ForgotPassword, ResetPassword (yazılıb, comment-dədir)
5. **UsersController** - DeleteAccount, ChangePassword, GetUserShelves, UserYearChallenge endpoint-ləri
6. **BooksController** - CreateBook, UpdateBook, DeleteBook, AddGenresToBook, RemoveGenreFromBook, GetBooksByGenre, GetBookReviews

---

## 🎯 NÖVBƏTİ ADDIMLAR

Hansı funksiyanı ilk öncə yazmaq istəyirsən?
















