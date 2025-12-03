# BookClubProject vs Goodreads-Clone Müqayisəsi

## 📋 ÜMUMİ BAXIŞ

Bu sənəd BookClubProject və goodreads-clone-master layihələri arasındakı fərqləri göstərir.

---

## ❌ TAMAMEN QALAN FUNKSİYALAR

### 1. **ReadingProgressController** - YOXDUR
**Endpoint-lər:**
- ❌ POST /api/reading-progress (Oxuma proqresini yenilə)
- ❌ GET /api/reading-progress (İstifadəçinin oxuma proqreslərini gətir)

**Lazım olan komponentlər:**
- ✅ Entity: `ReadingProgress` (Configuration var, amma Entity yoxdur)
- ❌ DTO: `ReadingProgressDto`
- ❌ Commands: `UpdateReadingProgress`
- ❌ Queries: `GetReadingProgresses`
- ❌ Controller: `ReadingProgressController`
- ❌ DbContext-ə əlavə etmək
- ❌ Migration yaratmaq

---

### 2. **UserYearChallengeController** - YOXDUR
**Endpoint-lər:**
- ❌ GET /api/user-year-challenge/{year} (Müəyyən il üçün challenge detalları)
- ❌ GET /api/user-year-challenge (Bütün challenge-ləri gətir)
- ❌ POST /api/user-year-challenge/upsert (Challenge yarat və ya yenilə)

**Lazım olan komponentlər:**
- ✅ Entity: `UserYearChallenge` (Configuration var, amma Entity yoxdur)
- ❌ DTOs: `UserYearChallengeDto`, `UserYearChallengeDetailsDto`, `ChallengeBookDto`
- ❌ Commands: `UpsertUserYearChallenge`
- ❌ Queries: `GetUserYearChallenge`, `GetAllUserYearChallenges`
- ❌ Controller: `UserYearChallengeController`
- ❌ DbContext-ə əlavə etmək
- ❌ Migration yaratmaq
- ❌ `CreateReview` və `UpdateBookStatus` handler-lərində challenge yeniləməni aktivləşdirmək

---

### 3. **AuthorClaimRequestsController** - YOXDUR
**Endpoint-lər:**
- ❌ POST /api/author-claims/request (Müəllif iddiası göndər - User)
- ❌ PUT /api/author-claims/review (İddianı nəzərdən keçir - Admin)
- ❌ GET /api/author-claims (Bütün iddiaları gətir - Admin)

**Lazım olan komponentlər:**
- ❌ Entity: `AuthorClaimRequest` (tamamilə yoxdur)
- ❌ Enum: `ClaimRequestStatus` (Pending, Approved, Rejected)
- ❌ DTO: `AuthorClaimRequestDto`
- ❌ Commands: `RequestAuthorClaim`, `ReviewAuthorClaim`
- ❌ Queries: `GetAllAuthorClaimRequests`
- ❌ Controller: `AuthorClaimRequestsController`
- ❌ DbContext-ə əlavə etmək
- ❌ Migration yaratmaq

---

## 🔧 QISMƏN QALAN FUNKSİYALAR

### 4. **Exception Handler Middlewares** - YOXDUR
**Lazım olan:**
- ❌ `GlobalExceptionHandler.cs` - Ümumi xəta idarəetməsi
- ❌ `ValidationExceptionHandler.cs` - Validasiya xəta idarəetməsi
- ❌ `AuthorizationExceptionHandler.cs` - İcazə xəta idarəetməsi
- ❌ Program.cs-də middleware-ləri aktivləşdirmək

**Hal-hazırda:**
- Middleware-lər comment-dədir DependencyInjection.cs-də

---

### 5. **DTO-lar**
**Qalan DTO-lar:**
- ❌ `BookDetailDto` - Kitabın detallı məlumatları üçün
- ❌ `ReadingProgressDto` - Oxuma proqresi üçün
- ❌ `UserYearChallengeDto` - İllik challenge üçün
- ❌ `UserYearChallengeDetailsDto` - Challenge detalları üçün
- ❌ `ChallengeBookDto` - Challenge-dəki kitablar üçün
- ❌ `AuthorClaimRequestDto` - Müəllif iddiası üçün

---

### 6. **BooksController - Qalan Endpoint-lər**
**Comment-də olan endpoint-lər:**
- ❌ POST /api/books (CreateBook)
- ❌ PUT /api/books (UpdateBook)
- ❌ DELETE /api/books/{id} (DeleteBook)
- ❌ POST /api/books/{bookId}/genres (AddGenresToBook)
- ❌ DELETE /api/books/{bookId}/genres/{genreId} (RemoveGenreFromBook)
- ❌ GET /api/books/by-genre (GetBooksByGenre)
- ❌ GET /api/books/{bookId}/reviews (GetBookReviews)

---

### 7. **UsersController - Qalan Endpoint-lər**
**Comment-də olan endpoint-lər:**
- ❌ DELETE /api/users/me (DeleteAccount)
- ❌ POST /api/users/me/change-password (ChangePassword)
- ❌ GET /api/users/{userId}/shelves
- ❌ GET /api/users/me/yearlychallenges (UserYearChallenge)
- ❌ GET /api/users/me/yearlychallenges/{year} (UserYearChallenge)
- ❌ GET /api/users/{userId}/reviews

---

### 8. **AuthController - Qalan Endpoint-lər**
**Comment-də olan endpoint-lər:**
- ❌ POST /api/auth/reset-confirmation-email (ResetEmailConfirmation)
- ❌ POST /api/auth/forgot-password (ForgotPassword - yazılıb, amma comment-dədir)
- ❌ POST /api/auth/reset-password (ResetPassword - yazılıb, amma comment-dədir)

---

## 📊 STATİSTİKA

### Controller-lər:
- **Tam olan:** 7 controller
- **Qismən olan:** 2 controller (UsersController, BooksController)
- **Tamamən qalan:** 3 controller (AuthorClaimRequests, ReadingProgress, UserYearChallenge)

### Entity-lər:
- **Qalan:** 3 entity (AuthorClaimRequest, ReadingProgress, UserYearChallenge)

### DTO-lar:
- **Qalan:** 6 DTO (BookDetailDto, ReadingProgressDto, UserYearChallengeDto, UserYearChallengeDetailsDto, ChallengeBookDto, AuthorClaimRequestDto)

### Middleware-lər:
- **Qalan:** 3 middleware (GlobalExceptionHandler, ValidationExceptionHandler, AuthorizationExceptionHandler)

### Endpoint-lər:
- **Tam olan:** ~45 endpoint
- **Comment-də olan:** ~15 endpoint
- **Tamamən qalan:** ~8 endpoint

---

## 🎯 NÖVBƏTİ ADDIMLAR

### Prioritet 1: Əsas Funksiyalar
1. **ReadingProgressController** - Oxuma proqresi funksionallığı
2. **UserYearChallengeController** - İllik challenge funksionallığı
3. **AuthorClaimRequestsController** - Müəllif iddiası funksionallığı

### Prioritet 2: Middleware-lər
4. Exception Handler Middleware-ləri aktivləşdirmək

### Prioritet 3: Qalan Endpoint-lər
5. BooksController-dəki comment-də olan endpoint-ləri aktivləşdirmək
6. UsersController-dəki comment-də olan endpoint-ləri aktivləşdirmək
7. AuthController-dəki comment-də olan endpoint-ləri aktivləşdirmək

---

## 📝 QEYDLƏR

- BookClubProject-də `FeedController` var, amma goodreads-clone-də yoxdur (bu BookClubProject-ə xas funksiyadır)
- BookClubProject-də `FeedItemDto` var, amma goodreads-clone-də yoxdur
- Bəzi configuration faylları var (ReadingProgressConfiguration, UserYearChallengeConfiguration), amma entity-lər və controller-lər yoxdur

