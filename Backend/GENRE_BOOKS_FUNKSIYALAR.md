# Genre-Book Funksiyaları - Müqayisə

## 📊 MÜQAYISƏ

### 1. AddGenresToBook ⭐⭐ (Asan - 15-20 dəqiqə)
**Nə edir:** Kitaba bir və ya bir neçə genre əlavə edir.

**Çətinlik:** Asan
- BookGenre many-to-many əlaqəsi
- Duplicate yoxlaması var (artıq əlavə edilibsə, yenidən əlavə etmir)
- Genre-lərin mövcud olduğunu yoxlayır

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `AddGenresToBookCommand.cs`
   - `AddGenresToBookCommandHandler.cs`
   - `AddGenresToBookCommandValidator.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Books/Commands/AddGenresToBook/`

3. Controller-də comment aç:
   - `BooksController.cs` - 94-105 sətirlər

**Qeyd:** `IRequireBookAuthorization` interface-i varsa, onu da kopyala və ya sil (bizim layihədə yoxdursa).

---

### 2. RemoveGenreFromBook ⭐ (Çox asan - 10-15 dəqiqə)
**Nə edir:** Kitabdan bir genre silir.

**Çətinlik:** Çox asan
- Sadəcə BookGenre əlaqəsini silir
- Book və Genre-nin mövcud olduğunu yoxlayır

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `RemoveGenreFromBookCommand.cs`
   - `RemoveGenreFromBookCommandHandler.cs`
   - `RemoveGenreFromBookCommandValidator.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Books/Commands/RemoveGenreFromBook/`

3. Controller-də comment aç:
   - `BooksController.cs` - 107-118 sətirlər

**Qeyd:** `IRequireBookAuthorization` interface-i varsa, onu da kopyala və ya sil (bizim layihədə yoxdursa).

---

### 3. GetBooksByGenre ⭐⭐ (Asan - 15-20 dəqiqə)
**Nə edir:** Müəyyən bir genre-ə aid olan kitabları gətirir (pagination ilə).

**Çətinlik:** Asan
- Query funksiyası (Command deyil)
- Genre adına görə filter edir
- Pagination dəstəkləyir

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `GetBooksByGenreQuery.cs`
   - `GetBooksByGenreQueryHandelr.cs` (Qeyd: Fayl adında typo var - "Handelr" yazılıb, amma kopyalayanda düzəltmək lazım deyil, olduğu kimi saxla)
   - `GetBooksByGenreQueryValidator.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Books/Queries/GetBooksByGenre/`

3. Controller-də comment aç:
   - `BooksController.cs` - 121-129 sətirlər
   - `using Goodreads.Application.Books.Queries.GetBooksByGenre;` əlavə et

**Qeyd:** QueryParameters-də `Query` property-si genre adını saxlayır.

---

## ✅ NƏTICƏ

**Hamısı asandır:**
- ✅ AddGenresToBook - Asan (15-20 dəqiqə)
- ✅ RemoveGenreFromBook - Çox asan (10-15 dəqiqə)
- ✅ GetBooksByGenre - Asan (15-20 dəqiqə)

**Ümumi vaxt:** ~45-55 dəqiqə

---

## 📝 TAPŞIRIQ

**Komanda üzvü üçün:**

1. **RemoveGenreFromBook** - Çox asan, kopyala və comment aç (10-15 dəq)
2. **AddGenresToBook** - Asan, kopyala və comment aç (15-20 dəq)
3. **GetBooksByGenre** - Asan, kopyala və comment aç (15-20 dəq)

**Qeyd:** Hamısı sadə kopyalama və comment açma işidir. Xüsusi dəyişiklik lazım deyil.
















