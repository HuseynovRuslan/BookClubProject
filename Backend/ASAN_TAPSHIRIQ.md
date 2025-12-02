# Asan Tapşırıqlar - Komanda Üzvü üçün

## 🎯 ÜMUMİ MƏQSƏD
5 funksiyanı aktivləşdirmək və ya yazmaq.

---

## ✅ 1. ForgotPassword (5 dəqiqə)
**Status:** Artıq yazılıb, sadəcə comment açmaq lazımdır.

**Nə et:**
- `Backend/Goodreads.API/Controllers/AuthController.cs` faylını aç
- 105-117 sətirlərdəki `//` işarələrini sil
- `using Goodreads.Application.Auth.Commands.ForgotPassword;` əlavə et (əgər yoxdursa)

---

## ✅ 2. ResetPassword (5 dəqiqə)
**Status:** Artıq yazılıb, sadəcə comment açmaq lazımdır.

**Nə et:**
- `Backend/Goodreads.API/Controllers/AuthController.cs` faylını aç
- 120-130 sətirlərdəki `//` işarələrini sil
- `using Goodreads.Application.Auth.Commands.ResetPassword;` əlavə et (əgər yoxdursa)

---

## 📝 3. ResetEmailConfirmation (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, bələdçi layihədən kopyalamaq lazımdır.

**Nə et:**
1. Bələdçi layihədən kopyala:
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Auth\Commands\ResetEmailConfirmation\ResetEmailConfirmationCommand.cs`
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Auth\Commands\ResetEmailConfirmation\ResetEmailConfirmationHandler.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Auth/Commands/ResetEmailConfirmation/` qovluğu yarat
   - Faylları ora kopyala

3. Controller-də comment aç:
   - `Backend/Goodreads.API/Controllers/AuthController.cs` - 92-103 sətirlərdəki `//` işarələrini sil
   - `using Goodreads.Application.Auth.Commands.ResetEmailConfirmation;` əlavə et

**Qeyd:** Handler adı `ResetEmailConfirmationHandler.cs`-dir, `ResetEmailConfirmationCommandHandler.cs` deyil!

---

## 📝 4. ChangePassword (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, bələdçi layihədən kopyalamaq lazımdır.

**Nə et:**
1. Bələdçi layihədən kopyala:
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\ChangePassword\ChangePasswordCommand.cs`
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\ChangePassword\ChangePasswordCommandHandler.cs`
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\ChangePassword\ChangePasswordCommandValidator.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Users/Commands/ChangePassword/` qovluğu yarat
   - Faylları ora kopyala

3. Controller-də comment aç:
   - `Backend/Goodreads.API/Controllers/UsersController.cs` - 128-141 sətirlərdəki `//` işarələrini sil
   - `using Goodreads.Application.Users.Commands.ChangePassword;` əlavə et (8-ci sətirdə comment-dədir, onu da aç)

---

## 📝 5. DeleteAccount (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, bələdçi layihədən kopyalamaq lazımdır.

**Nə et:**
1. Bələdçi layihədən kopyala:
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\DeleteAccount\DeleteAccountCommand.cs`
   - `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\DeleteAccount\DeleteAccountCommandHandler.cs`

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Users/Commands/DeleteAccount/` qovluğu yarat
   - Faylları ora kopyala

3. Controller-də comment aç:
   - `Backend/Goodreads.API/Controllers/UsersController.cs` - 86-98 sətirlərdəki `//` işarələrini sil
   - `using Goodreads.Application.Users.Commands.DeleteAccount;` əlavə et (9-cu sətirdə comment-dədir, onu da aç)

---

## ✅ YOXLAMA

Hər funksiyadan sonra:
1. `dotnet build` - Build et
2. Error-ları yoxla
3. Swagger-də endpoint görünürsə, hazırdır ✅

**Ümumi vaxt:** ~1 saat

**Qeyd:** Kopyaladıqdan sonra namespace-ləri yoxla, bizim layihəyə uyğun olmalıdır. Əgər error varsa, namespace-ləri düzəlt.
















