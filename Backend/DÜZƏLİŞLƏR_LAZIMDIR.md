# 🔧 Backend-də Düzəlişlər Lazımdır

## 📋 XÜLASƏ

Frontend və Backend-i müqayisə etdikdə aşağıdakı problemlər var:

---

## 🔴 KRİTİK DÜZƏLİŞLƏR

### 1. **POST /api/Books/{bookId}/status** - Status Update Endpoint

**Problem:**
- Frontend body-də `{ status: "reading" }` göndərir
- Backend query parameter-də `targetShelfName` gözləyir
- Frontend status formatı: `"reading"`, `"want-to-read"`, `"read"`, `"currently-reading"`
- Backend shelf adları: `"Want to Read"`, `"Currently Reading"`, `"Read"`

**Həll:**
Backend-də `BooksController.cs`-də `UpdateBookStatus` metodunu dəyişdir:

```csharp
[HttpPost("{bookId}/status")]
[Authorize]
public async Task<IActionResult> UpdateBookStatus(string bookId, [FromBody] UpdateBookStatusRequest request)
{
    // Status-u shelf adına çevir
    string? targetShelfName = request.Status switch
    {
        "reading" or "currently-reading" => DefaultShelves.CurrentlyReading,
        "want-to-read" => DefaultShelves.WantToRead,
        "read" => DefaultShelves.Read,
        _ => null
    };
    
    var command = new UpdateBookStatusCommand(bookId, targetShelfName);
    var result = await mediator.Send(command);
    
    return result.Match(
        () => NoContent(),
        failure => CustomResults.Problem(failure));
}
```

Və yeni request model əlavə et:
```csharp
public record UpdateBookStatusRequest(string Status);
```

---

### 2. **GET /api/Auth/confirm-email** - Email Confirmation

**Problem:**
- Frontend yalnız `token` query parameter göndərir: `?token=...`
- Backend həm `userId` həm də `token` gözləyir: `?userId=...&token=...`

**Həll 1 (Tövsiyə olunan):** Backend-də token-dan userId-ni extract et
- Token-dan userId-ni decode edə bilərsən (əgər token-də var)
- Və ya token-dan user-i tap

**Həll 2:** Frontend-i dəyişdir ki, `userId` də göndərsin (amma bu daha az təhlükəsizdir)

---

## 🟡 ÇATIŞMAYAN ENDPOINT-LƏR (Comment edilib, amma Frontend istifadə edir)

### 3. **POST /api/Books** - Book yaratmaq

**Problem:** Frontend `createBook()` funksiyası istifadə edir, amma backend comment edilib.

**Həll:** `BooksController.cs`-də comment-ləri sil və aktivləşdir:

```csharp
[HttpPost]
[Authorize]
[EndpointSummary("Create a new book")]
[ProducesResponseType(typeof(ApiResponse), StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> CreateBook([FromForm] CreateBookCommand command)
{
    var result = await mediator.Send(command);
    return result.Match(
        id => CreatedAtAction(nameof(GetBookById), new { id }, ApiResponse.Success("Book created successfully")),
        failure => CustomResults.Problem(failure));
}
```

**Qeyd:** Frontend JSON göndərir (`body: bookData`), amma backend `[FromForm]` gözləyir. Bu da uyğunsuzluqdur. Ya frontend FormData göndərməlidir, ya da backend `[FromBody]` qəbul etməlidir.

---

### 4. **POST /api/Books/{bookId}/genres** - Book-a genre əlavə etmək

**Problem:** Frontend `addGenresToBook()` istifadə edir, amma backend comment edilib.

**Həll:** `BooksController.cs`-də comment-ləri sil:

```csharp
[HttpPost("{bookId}/genres")]
[Authorize]
[EndpointSummary("Add genres to a book")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> AddGenresToBook(string bookId, [FromBody] List<string> GenreIds)
{
    var result = await mediator.Send(new AddGenresToBookCommand(bookId, GenreIds));
    return result.Match(
        () => Ok(),
        failure => CustomResults.Problem(failure));
}
```

**Qeyd:** Frontend `{ genreIds: [...] }` göndərir, backend `List<string> GenreIds` gözləyir. Bu uyğun olmalıdır.

---

### 5. **DELETE /api/Books/{bookId}/genres/{genreId}** - Book-dan genre silmək

**Problem:** Frontend `removeGenreFromBook()` istifadə edir, amma backend comment edilib.

**Həll:** `BooksController.cs`-də comment-ləri sil:

```csharp
[HttpDelete("{bookId}/genres/{genreId}")]
[Authorize]
[EndpointSummary("Remove a genre from a book")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> RemoveGenreFromBook(string bookId, string genreId)
{
    var result = await mediator.Send(new RemoveGenreFromBookCommand(bookId, genreId));
    return result.Match(
        () => NoContent(),
        failure => CustomResults.Problem(failure));
}
```

---

### 6. **GET /api/Books/by-genre** - Genre-ə görə book-ları gətirmək

**Problem:** Frontend `getBooksByGenre()` istifadə edir, amma backend comment edilib.

**Həll:** `BooksController.cs`-də comment-ləri sil:

```csharp
[HttpGet("by-genre")]
[EndpointSummary("Get books by genre")]
[ProducesResponseType(typeof(PagedResult<BookDto>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> GetBooksByGenre([FromQuery] QueryParameters parameters)
{
    var result = await mediator.Send(new GetBooksByGenreQuery(parameters));
    return Ok(result);
}
```

**Qeyd:** Frontend `genreId` query parameter göndərir, `GetBooksByGenreQuery` bunu dəstəkləməlidir.

---

## ✅ YAXŞI XƏBƏR

Əksər endpoint-lər uyğundur! Yalnız yuxarıdakı düzəlişlər lazımdır.

---

## 📝 ADDIMLAR

1. ✅ `UpdateBookStatus` endpoint-ini düzəlt (body-dən oxu, status-u map et)
2. ✅ `ConfirmEmail` endpoint-ini düzəlt (yalnız token qəbul et)
3. ✅ Comment edilmiş endpoint-ləri aktivləşdir:
   - POST /api/Books
   - POST /api/Books/{bookId}/genres
   - DELETE /api/Books/{bookId}/genres/{genreId}
   - GET /api/Books/by-genre
4. ✅ `CreateBook` endpoint-ini yoxla - frontend JSON göndərir, backend FormData gözləyir (bu da uyğunsuzluqdur)

---

## 🔍 ƏLAVƏ YOXLAMALAR

- `CreateBookCommand` və `GetBooksByGenreQuery` class-larının mövcud olduğunu yoxla
- `AddGenresToBookCommand` və `RemoveGenreFromBookCommand` class-larının mövcud olduğunu yoxla
- Frontend-də `createBook` funksiyasının nə göndərdiyini yoxla (JSON yoxsa FormData?)

