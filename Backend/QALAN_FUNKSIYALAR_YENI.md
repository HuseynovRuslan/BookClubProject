# 📋 QALAN FUNKSİYALAR - YENİLƏNMİŞ SİYAHI

## ❌ TAMAMEN QALAN CONTROLLER-LƏR (3)

### 1. **ReadingProgressController** - YOXDUR
**Endpoint-lər:**
- ❌ POST /api/reading-progress (Oxuma proqresini yenilə)
- ❌ GET /api/reading-progress (İstifadəçinin oxuma proqreslərini gətir)

**Lazım olan komponentlər:**
- ❌ Entity: `ReadingProgress` (Configuration var, amma Entity yoxdur)
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
- ❌ Entity: `UserYearChallenge` (Configuration var, amma Entity yoxdur)
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
- ❌ Program.cs-də `app.UseExceptionHandler()` aktivləşdirmək
- ❌ DependencyInjection.cs-də middleware-ləri qeydiyyata almaq

**Hal-hazırda:**
- Middleware-lər comment-dədir DependencyInjection.cs-də
- Program.cs-də `app.UseExceptionHandler()` comment-dədir

---

### 5. **AuthorizationBehavior** - YOXDUR
**Lazım olan:**
- ❌ `AuthorizationBehavior.cs` - MediatR pipeline behavior
- ❌ Authorization interfeysləri:
  - `IAuthorAuthorizationService` və implementasiyası
  - `IShelfAuthorizationService` və implementasiyası
  - `IReviewAuthorizationService` və implementasiyası
  - `IRequireAuthorAuthorization` interface
  - `IRequireBookAuthorization` interface
  - `IRequireShelfAuthorization` interface
  - `IRequireReviewAuthorization` interface

**Hal-hazırda:**
- ✅ `IQuoteAuthorizationService` var
- ✅ `IRequireQuoteAuthorization` var
- ❌ Digər authorization interfeysləri yoxdur

---

### 6. **DTO-lar** (5 qalan)
**Qalan DTO-lar:**
- ❌ `ReadingProgressDto` - Oxuma proqresi üçün
- ❌ `UserYearChallengeDto` - İllik challenge üçün
- ❌ `UserYearChallengeDetailsDto` - Challenge detalları üçün
- ❌ `ChallengeBookDto` - Challenge-dəki kitablar üçün
- ❌ `AuthorClaimRequestDto` - Müəllif iddiası üçün

**✅ Həll edildi:**
- ✅ `BookDetailDto` - **LAZIM DEYİL** (BookDto-ya lazımi məlumatlar əlavə edildi)

---

### 7. **BooksController - Qalan Endpoint** (1 qalan)
**Comment-də olan endpoint:**
- ❌ GET /api/books/{bookId}/reviews (GetBookReviews)

**✅ Artıq aktiv olan endpoint-lər:**
- ✅ POST /api/books (CreateBook)
- ✅ PUT /api/books (UpdateBook)
- ✅ DELETE /api/books/{id} (DeleteBook)
- ✅ POST /api/books/{bookId}/genres (AddGenresToBook)
- ✅ DELETE /api/books/{bookId}/genres/{genreId} (RemoveGenreFromBook)
- ✅ GET /api/books/by-genre (GetBooksByGenre)

---

### 8. **UsersController - Qalan Endpoint-lər** (5 qalan)
**Comment-də olan endpoint-lər:**
- ❌ DELETE /api/users/me (DeleteAccount)
- ❌ POST /api/users/me/change-password (ChangePassword)
- ❌ GET /api/users/{userId}/shelves (GetUserShelves by userId)
- ❌ GET /api/users/me/yearlychallenges (UserYearChallenge - UserYearChallengeController lazımdır)
- ❌ GET /api/users/me/yearlychallenges/{year} (UserYearChallenge - UserYearChallengeController lazımdır)
- ❌ GET /api/users/{userId}/reviews (GetUserReviews by userId)

**✅ Artıq aktiv olan endpoint-lər:**
- ✅ GET /api/users/me/shelves (GetMyShelves)

---

### 9. **AuthController - Qalan Endpoint-lər** (3 qalan)
**Comment-də olan endpoint-lər:**
- ❌ POST /api/auth/reset-confirmation-email (ResetEmailConfirmation)
- ❌ POST /api/auth/forgot-password (ForgotPassword - yazılıb, amma comment-dədir)
- ❌ POST /api/auth/reset-password (ResetPassword - yazılıb, amma comment-dədir)

---

## 📊 ÜMUMİ STATİSTİKA

### Controller-lər:
- **Tam olan:** 10 controller (Auth, Authors, Books, Feed, Genres, Quotes, Reviews, Shelves, UserFollows, Users)
- **Tamamən qalan:** 3 controller (AuthorClaimRequests, ReadingProgress, UserYearChallenge)

### Entity-lər:
- **Mövcud:** 13 entity
- **Qalan:** 3 entity (AuthorClaimRequest, ReadingProgress, UserYearChallenge)

### DTO-lar:
- **Mövcud:** 12 DTO
- **Qalan:** 5 DTO (ReadingProgressDto, UserYearChallengeDto, UserYearChallengeDetailsDto, ChallengeBookDto, AuthorClaimRequestDto)

### Middleware-lər:
- **Qalan:** 3 middleware (GlobalExceptionHandler, ValidationExceptionHandler, AuthorizationExceptionHandler)

### Behavior-lər:
- **Mövcud:** 1 behavior (ValidationBehavior)
- **Qalan:** 1 behavior (AuthorizationBehavior)

### Authorization Interface-lər:
- **Mövcud:** 2 interface (IQuoteAuthorizationService, IRequireQuoteAuthorization)
- **Qalan:** 6 interface və implementasiyaları

### Endpoint-lər:
- **Tam olan:** ~50+ endpoint
- **Comment-də olan:** ~9 endpoint
- **Tamamən qalan:** ~8 endpoint (3 yeni controller-dən)

---

## 🎯 NÖVBƏTİ ADDIMLAR (Prioritet sırası ilə)

### Prioritet 1: Əsas Funksiyalar
1. **ReadingProgressController** - Oxuma proqresi funksionallığı
2. **UserYearChallengeController** - İllik challenge funksionallığı
3. **AuthorClaimRequestsController** - Müəllif iddiası funksionallığı

### Prioritet 2: Middleware və Authorization
4. Exception Handler Middleware-ləri yaratmaq və aktivləşdirmək
5. AuthorizationBehavior və authorization interfeyslərini yaratmaq

### Prioritet 3: Qalan Endpoint-lər
6. BooksController-dəki GetBookReviews endpoint-ini aktivləşdirmək
7. UsersController-dəki comment-də olan endpoint-ləri aktivləşdirmək
8. AuthController-dəki comment-də olan endpoint-ləri aktivləşdirmək

---

## 📝 QEYDLƏR

- ✅ BookClubProject-də `FeedController` var, amma goodreads-clone-də yoxdur (bu BookClubProject-ə xas funksiyadır)
- ✅ BookClubProject-də `FeedItemDto` var, amma goodreads-clone-də yoxdur
- ✅ BookDetailDto lazım deyil - BookDto-ya lazımi məlumatlar əlavə edildi
- ✅ BooksController-dəki əksər endpoint-lər artıq aktivdir
- ⚠️ Bəzi configuration faylları var (ReadingProgressConfiguration, UserYearChallengeConfiguration), amma entity-lər və controller-lər yoxdur
- ⚠️ BookClubProject-də `ILocalStorageService` istifadə olunur, goodreads-clone-də isə `IBlobStorageService` (AWS S3) istifadə olunur - bu fərqli implementasiya seçimidir, hər ikisi də düzgündür

---

## ✅ TAMAMLANAN İŞLƏR

1. ✅ BookDto-ya lazımi məlumatlar əlavə edildi (Description, ISBN, PublicationDate, PageCount, RatingCount)
2. ✅ BooksController-dəki əksər endpoint-lər aktivdir

