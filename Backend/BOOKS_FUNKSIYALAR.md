# Books Funksiyaları - Müqayisə

## 📊 MÜQAYISƏ

### CreateBook
**Bələdçi layihədə:** BlobStorage istifadə edir (Azure Blob Storage)
**Bizim layihədə:** Local storage istifadə edirik (wwwroot/images/books)

**Çətinlik:** ⭐⭐⭐ (Orta)
- CreateAuthor-ə bənzəyir, amma daha çox field var
- CoverImage upload etmək lazımdır (local storage)
- AutoMapper mapping lazımdır

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `CreateBookCommand.cs`
   - `CreateBookCommandHandler.cs` (BlobStorage-u local storage ilə dəyişdir)
   - `CreateBookCommandValidator.cs`

2. Handler-də dəyişiklik:
   - `IBlobStorageService` → `IWebHostEnvironment`
   - BlobStorage upload → Local file save (CreateAuthor kimi)
   - `wwwroot/images/books` qovluğuna yadda saxla

3. Controller-də comment aç:
   - `BooksController.cs` - 53-64 sətirlər

---

### UpdateBook
**Çətinlik:** ⭐⭐ (Asan)
- Sadə update funksiyası
- AutoMapper istifadə edir
- CoverImage yoxdur, sadəcə field-lər update edilir

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `UpdateBookCommand.cs`
   - `UpdateBookCommandHandler.cs`
   - `UpdateBookCommandValidator.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Books/Commands/UpdateBook/`

3. Controller-də comment aç:
   - `BooksController.cs` - 66-78 sətirlər

**Qeyd:** `IRequireAuthorAuthorization` interface-i varsa, onu da kopyala və ya sil (bizim layihədə yoxdursa).

---

### DeleteBook
**Çətinlik:** ⭐ (Çox asan)
- Çox sadə silmə funksiyası
- Sadəcə Book-u silir

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `DeleteBookCommand.cs`
   - `DeleteBookCommandHandler.cs`
   - Validator yoxdur

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Books/Commands/DeleteBook/DeleteBookCommand/` (qovluq strukturuna diqqət!)

3. Controller-də comment aç:
   - `BooksController.cs` - 79-92 sətirlər

---

## ✅ NƏTICƏ

**Asan olanlar:**
- ✅ DeleteBook - Çox asan (5-10 dəqiqə)
- ✅ UpdateBook - Asan (15-20 dəqiqə)

**Orta çətinlik:**
- ⚠️ CreateBook - Orta (30-40 dəqiqə, çünki local storage-a uyğunlaşdırmaq lazımdır)

**Ümumi vaxt:** ~1 saat

---

## 📝 TAPŞIRIQ

**Komanda üzvü üçün:**

1. **DeleteBook** - Çox asan, kopyala və comment aç (5-10 dəq)
2. **UpdateBook** - Asan, kopyala və comment aç (15-20 dəq)
3. **CreateBook** - Orta, kopyala, local storage-a uyğunlaşdır və comment aç (30-40 dəq)

**Qeyd:** CreateBook-da CreateAuthor-dəki kimi local storage istifadə etmək lazımdır (BlobStorage deyil).
















