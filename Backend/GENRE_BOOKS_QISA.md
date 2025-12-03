# Genre-Book Funksiyaları - Qısa Təlimat

## 🎯 Tapşırıq
3 funksiya yazmaq: AddGenresToBook, RemoveGenreFromBook, GetBooksByGenre

---

## 📋 Addım-Addım

### 1️⃣ AddGenresToBook
1. `Backend/Goodreads.Application/Books/Commands/AddGenresToBook/` qovluğu yarat
2. Bələdçi layihədən 3 faylı kopyala (Command, Handler, Validator)
3. `IRequireBookAuthorization` interface-i varsa, sil
4. `BooksController.cs`-də 94-105 sətirlərdəki comment-ləri aç

### 2️⃣ RemoveGenreFromBook
1. `Backend/Goodreads.Application/Books/Commands/RemoveGenreFromBook/` qovluğu yarat
2. Bələdçi layihədən 3 faylı kopyala (Command, Handler, Validator)
3. `IRequireBookAuthorization` interface-i varsa, sil
4. `BooksController.cs`-də 107-118 sətirlərdəki comment-ləri aç

### 3️⃣ GetBooksByGenre
1. `Backend/Goodreads.Application/Books/Queries/GetBooksByGenre/` qovluğu yarat
2. Bələdçi layihədən 3 faylı kopyala (Query, Handler, Validator)
3. `BooksController.cs`-də 121-129 sətirlərdəki comment-ləri aç

---

## ✅ Yoxlama
1. `dotnet build` - Build et
2. Error-ları yoxla və düzəlt
3. Swagger-də endpoint görünürsə, hazırdır ✅

**Ümumi vaxt:** ~45-55 dəqiqə
















