# Genre-Book Funksiyaları - Komanda Üzvü üçün Tapşırıq

## 🎯 MƏQSƏD
3 funksiya yazmaq:
1. **AddGenresToBook** - Kitaba genre əlavə etmək
2. **RemoveGenreFromBook** - Kitabdan genre silmək
3. **GetBooksByGenre** - Genre-ə görə kitabları gətirmək

---

## 📝 1. AddGenresToBook (15-20 dəqiqə)

### Addım 1: Qovluq yarat
`Backend/Goodreads.Application/Books/Commands/AddGenresToBook/` qovluğunu yarat

### Addım 2: Bələdçi layihədən kopyala
Bələdçi layihədən bu faylları kopyala:
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\AddGenresToBook\AddGenresToBookCommand.cs`
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\AddGenresToBook\AddGenresToBookCommandHandler.cs`
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\AddGenresToBook\AddGenresToBookCommandValidator.cs`

### Addım 3: Namespace-ləri yoxla
Faylları aç və namespace-lərin bizim layihəyə uyğun olduğunu yoxla:
- `namespace Goodreads.Application.Books.Commands.AddGenresToBook;` - Düzgündür

### Addım 4: Interface-i yoxla
`AddGenresToBookCommand.cs` faylında `IRequireBookAuthorization` interface-i varsa:
- Əgər bizim layihədə bu interface yoxdursa, onu sil
- Yəni: `public record AddGenresToBookCommand(...) : IRequest<Result>, IRequireBookAuthorization;`
- Dəyişdir: `public record AddGenresToBookCommand(...) : IRequest<Result>;`

### Addım 5: Controller-də comment aç
`Backend/Goodreads.API/Controllers/BooksController.cs` faylını aç:
- 94-105 sətirlərdəki `//` işarələrini sil
- `using Goodreads.Application.Books.Commands.AddGenresToBook;` əlavə et (əgər yoxdursa)

---

## 📝 2. RemoveGenreFromBook (10-15 dəqiqə)

### Addım 1: Qovluq yarat
`Backend/Goodreads.Application/Books/Commands/RemoveGenreFromBook/` qovluğunu yarat

### Addım 2: Bələdçi layihədən kopyala
Bələdçi layihədən bu faylları kopyala:
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\RemoveGenreFromBook\RemoveGenreFromBookCommand.cs`
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\RemoveGenreFromBook\RemoveGenreFromBookCommandHandler.cs`
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Commands\RemoveGenreFromBook\RemoveGenreFromBookCommandValidator.cs`

### Addım 3: Namespace-ləri yoxla
Faylları aç və namespace-lərin bizim layihəyə uyğun olduğunu yoxla

### Addım 4: Interface-i yoxla
`RemoveGenreFromBookCommand.cs` faylında `IRequireBookAuthorization` interface-i varsa, onu sil (bizim layihədə yoxdursa)

### Addım 5: Controller-də comment aç
`Backend/Goodreads.API/Controllers/BooksController.cs` faylını aç:
- 107-118 sətirlərdəki `//` işarələrini sil
- `using Goodreads.Application.Books.Commands.RemoveGenreFromBook;` əlavə et (əgər yoxdursa)

---

## 📝 3. GetBooksByGenre (15-20 dəqiqə)

### Addım 1: Qovluq yarat
`Backend/Goodreads.Application/Books/Queries/GetBooksByGenre/` qovluğunu yarat

### Addım 2: Bələdçi layihədən kopyala
Bələdçi layihədən bu faylları kopyala:
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Queries\GetBooksByGenre\GetBooksByGenreQuery.cs`
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Queries\GetBooksByGenre\GetBooksByGenreQueryHandelr.cs` (Qeyd: Fayl adında typo var "Handelr", amma olduğu kimi saxla)
- `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Books\Queries\GetBooksByGenre\GetBooksByGenreQueryValidator.cs`

### Addım 3: Namespace-ləri yoxla
Faylları aç və namespace-lərin bizim layihəyə uyğun olduğunu yoxla

### Addım 4: Validator-də yoxla
`GetBooksByGenreQueryValidator.cs` faylında `QueryParametersValidator` istifadə olunur. Əgər bizim layihədə yoxdursa:
- `using Goodreads.Application.Common.Validation;` namespace-ini yoxla
- Əgər error varsa, validator-u sadələşdir (yalnız əsas validation qoy)

### Addım 5: Controller-də comment aç
`Backend/Goodreads.API/Controllers/BooksController.cs` faylını aç:
- 121-129 sətirlərdəki `//` işarələrini sil
- `using Goodreads.Application.Books.Queries.GetBooksByGenre;` əlavə et (əgər yoxdursa)

---

## ✅ YOXLAMA

Hər funksiyadan sonra:

1. **Build et:**
   ```bash
   dotnet build
   ```

2. **Error-ları yoxla:**
   - Namespace error-ları varsa, düzəlt
   - Interface error-ları varsa, sil (IRequireBookAuthorization)
   - Missing using-lər varsa, əlavə et

3. **Swagger-də yoxla:**
   - Endpoint görünürsə, hazırdır ✅

---

## 🔍 ÜMUMİ QEYDLƏR

### Interface-lər:
- `IRequireBookAuthorization` - Əgər bizim layihədə yoxdursa, Command-lərdən sil

### Namespace-lər:
- Hamısı `Goodreads.Application.Books...` olmalıdır
- Bizim layihəyə uyğun olmalıdır

### Error-lar:
- Əgər `QueryParametersValidator` tapılmırsa, validator-u sadələşdir
- Əgər `BookErrors`, `GenreErrors` tapılmırsa, yoxla ki, bizim layihədə var

---

## 📊 ÜMUMİ VAXT
- AddGenresToBook: 15-20 dəqiqə
- RemoveGenreFromBook: 10-15 dəqiqə
- GetBooksByGenre: 15-20 dəqiqə
- **Ümumi: ~45-55 dəqiqə**

---

## 🎯 NƏTICƏ

Hamısı sadə kopyalama və comment açma işidir. Xüsusi məntiq yazmaq lazım deyil, bələdçi layihədən kopyalayıb bizim layihəyə uyğunlaşdırmaq kifayətdir.
















