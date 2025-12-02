# Frontend və Backend Müqayisəsi

## ❌ Uyğunsuzluqlar və Çatışmayan Endpoint-lər

### 1. **Auth Controller**

#### ✅ Uyğun olanlar:
- `POST /api/Auth/register` ✓
- `POST /api/Auth/login` ✓
- `POST /api/Auth/refresh` ✓
- `POST /api/Auth/logout` ✓

#### ⚠️ Uyğunsuzluq:
- **GET /api/Auth/confirm-email**
  - **Frontend gözləyir:** `GET /api/Auth/confirm-email?token=...`
  - **Backend tələb edir:** `GET /api/Auth/confirm-email?userId=...&token=...`
  - **Problem:** Frontend yalnız `token` göndərir, amma backend həm `userId` həm də `token` gözləyir

---

### 2. **Books Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Books?PageNumber=...&PageSize=...` ✓
- `GET /api/Books/{id}` ✓

#### ⚠️ Uyğunsuzluq:
- **POST /api/Books/{bookId}/status**
  - **Frontend göndərir:** `POST /api/Books/{bookId}/status` body: `{ status: "reading" }` 
    - Frontend status dəyərləri: `"reading"`, `"want-to-read"`, `"read"`, `"currently-reading"`
  - **Backend gözləyir:** `POST /api/Books/{bookId}/status?targetShelfName=...`
    - Backend shelf adları: `"Want to Read"`, `"Currently Reading"`, `"Read"`
  - **Problem:** 
    1. Frontend body-də `status` göndərir, backend query parameter-də `targetShelfName` gözləyir
    2. Frontend status formatı fərqlidir: `"reading"` vs `"Currently Reading"`
    3. Mapping lazımdır: `"reading"` → `"Currently Reading"`, `"want-to-read"` → `"Want to Read"`, `"read"` → `"Read"`

#### ❌ Çatışmayan endpoint-lər (Backend-də comment edilib):
- **POST /api/Books** - Frontend istifadə edir, backend comment edilib
- **POST /api/Books/{bookId}/genres** - Frontend istifadə edir, backend comment edilib
- **DELETE /api/Books/{bookId}/genres/{genreId}** - Frontend istifadə edir, backend comment edilib
- **GET /api/Books/by-genre?genreId=...&PageNumber=...&PageSize=...** - Frontend istifadə edir, backend comment edilib

---

### 3. **Users Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Users/me` ✓
- `PUT /api/Users/me` ✓
- `PATCH /api/Users/me/profile-picture` ✓
- `DELETE /api/Users/me/profile-picture` ✓
- `GET /api/Users/{username}` ✓
- `GET /api/Users/search?q=...` ✓
- `GET /api/Users/me/shelves` ✓
- `GET /api/Users/me/reviews` ✓
- `GET /api/Users/me/socials` ✓

#### ⚠️ Qeyd:
- `GET /api/Users/me/reviews` - Backend-də route `/api/Users/me/reviews/` (sonunda slash var), frontend `/api/Users/me/reviews` göndərir. Bu ASP.NET-də normal işləyə bilər, amma yoxlamaq lazımdır.

---

### 4. **Reviews Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Reviews/{id}` ✓
- `POST /api/Reviews` ✓
- `PUT /api/Reviews/{id}` ✓
- `DELETE /api/Reviews/{id}` ✓

#### ⚠️ Qeyd:
- Frontend-də `getReviews()` funksiyası var amma comment edilib və error throw edir. Backend-də də GET all reviews yoxdur.

---

### 5. **Shelves Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Shelves/{id}` ✓
- `POST /api/Shelves` ✓
- `PUT /api/Shelves` ✓ (Frontend body-də `id` göndərir, backend command-də `id` var)
- `DELETE /api/Shelves/{id}` ✓
- `POST /api/Shelves/{shelfId}/books/{bookId}` ✓
- `DELETE /api/Shelves/{shelfId}/books/{bookId}` ✓

---

### 6. **Feed Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Feed?pageNumber=...&pageSize=...` ✓

#### ⚠️ Qeyd:
- Frontend `pageNumber` və `pageSize` göndərir (lowercase), backend də eyni parametrləri gözləyir. Uyğundur.

---

### 7. **Quotes Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Quotes?Query=...&SortColumn=...&SortOrder=...&PageNumber=...&PageSize=...&Tag=...&UserId=...&AuthorId=...&BookId=...` ✓
- `GET /api/Quotes/me` ✓
- `GET /api/Quotes/{id}` ✓
- `POST /api/Quotes` ✓
- `PUT /api/Quotes/{id}` ✓
- `DELETE /api/Quotes/{id}` ✓
- `POST /api/Quotes/{id}/like` ✓

---

### 8. **Authors Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Authors?Query=...&SortColumn=...&SortOrder=...&PageNumber=...&PageSize=...` ✓
- `GET /api/Authors/{id}` ✓
- `POST /api/Authors` ✓ (FormData ilə)
- `GET /api/Authors/{authorId}/books` ✓

---

### 9. **Genres Controller**

#### ✅ Uyğun olanlar:
- `GET /api/Genres?Query=...&SortColumn=...&SortOrder=...&PageNumber=...&PageSize=...` ✓
- `GET /api/Genres/{id}` ✓

---

### 10. **UserFollows Controller**

#### ✅ Uyğun olanlar:
- `POST /api/UserFollows/follow` ✓
- `POST /api/UserFollows/unfollow` ✓
- `GET /api/UserFollows/followers` ✓
- `GET /api/UserFollows/following` ✓

---

## 📋 XÜLASƏ: Nə lazımdır?

### 🔴 KRİTİK Düzəlişlər:

1. **POST /api/Books/{bookId}/status** - Backend-i dəyişdir ki, body-dən `status` parametrini oxusun, query parameter yox
2. **GET /api/Auth/confirm-email** - Backend-i dəyişdir ki, yalnız `token` query parameter-ini qəbul etsin (və ya frontend-i dəyişdir ki, `userId` də göndərsin)

### 🟡 Çatışmayan Endpoint-lər (Backend-də comment edilib, amma Frontend istifadə edir):

1. **POST /api/Books** - Book yaratmaq üçün
2. **POST /api/Books/{bookId}/genres** - Book-a genre əlavə etmək üçün
3. **DELETE /api/Books/{bookId}/genres/{genreId}** - Book-dan genre silmək üçün
4. **GET /api/Books/by-genre** - Genre-ə görə book-ları gətirmək üçün

Bu endpoint-ləri backend-də aktivləşdirmək lazımdır (comment-ləri silmək).

---

## ✅ Yaxşı xəbər:

Əksər endpoint-lər uyğundur! Yalnız yuxarıdakı bir neçə düzəliş lazımdır.

