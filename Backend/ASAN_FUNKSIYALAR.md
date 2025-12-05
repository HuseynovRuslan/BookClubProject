# Asan Funksiyalar - Komanda Üzvü üçün

## 🟢 ÇOX ASAN (Sadəcə Comment Açmaq)

### 1. **ForgotPassword** ⭐⭐⭐⭐⭐ (5 dəqiqə)
**Status:** Command və Handler artıq yazılıb, sadəcə Controller-də comment açmaq lazımdır.

**Nə etmək lazımdır:**
1. `Goodreads.API/Controllers/AuthController.cs` faylını aç
2. 105-117 sətirlərdəki comment-ləri sil (// işarələrini sil)
3. `using Goodreads.Application.Auth.Commands.ForgotPassword;` əlavə et (əgər yoxdursa)

**Fayl yolu:** `Backend/Goodreads.API/Controllers/AuthController.cs`

---

### 2. **ResetPassword** ⭐⭐⭐⭐⭐ (5 dəqiqə)
**Status:** Command, Handler və Validator artıq yazılıb, sadəcə Controller-də comment açmaq lazımdır.

**Nə etmək lazımdır:**
1. `Goodreads.API/Controllers/AuthController.cs` faylını aç
2. 120-130 sətirlərdəki comment-ləri sil (// işarələrini sil)
3. `using Goodreads.Application.Auth.Commands.ResetPassword;` əlavə et (əgər yoxdursa)

**Fayl yolu:** `Backend/Goodreads.API/Controllers/AuthController.cs`

---

## 🟡 ASAN (Bələdçi Layihədən Kopyalamaq)

### 3. **ResetEmailConfirmation** ⭐⭐⭐⭐ (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, amma bələdçi layihədə var, kopyalaya bilərsən.

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `ResetEmailConfirmationCommand.cs`
   - `ResetEmailConfirmationHandler.cs` (Qeyd: Handler adı fərqlidir!)

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Auth/Commands/ResetEmailConfirmation/`

3. Controller-də comment aç:
   - `Goodreads.API/Controllers/AuthController.cs` - 92-103 sətirlər
   - `using Goodreads.Application.Auth.Commands.ResetEmailConfirmation;` əlavə et

**Bələdçi layihə yolu:** `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Auth\Commands\ResetEmailConfirmation\`

**Bizim layihə yolu:** `Backend/Goodreads.Application/Auth/Commands/ResetEmailConfirmation/`

**Qeyd:** Validator yoxdur, sadəcə Command və Handler var.

---

### 4. **ChangePassword** ⭐⭐⭐⭐ (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, amma bələdçi layihədə var, kopyalaya bilərsən.

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `ChangePasswordCommand.cs`
   - `ChangePasswordCommandHandler.cs`
   - `ChangePasswordCommandValidator.cs` (əgər varsa)

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Users/Commands/ChangePassword/`

3. Controller-də comment aç:
   - `Goodreads.API/Controllers/UsersController.cs` - 128-141 sətirlər
   - `using Goodreads.Application.Users.Commands.ChangePassword;` əlavə et

**Bələdçi layihə yolu:** `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\ChangePassword\`

**Bizim layihə yolu:** `Backend/Goodreads.Application/Users/Commands/ChangePassword/`

---

### 5. **DeleteAccount** ⭐⭐⭐⭐ (15-20 dəqiqə)
**Status:** Tamamilə yoxdur, amma bələdçi layihədə var, kopyalaya bilərsən.

**Nə etmək lazımdır:**
1. Bələdçi layihədən kopyala:
   - `DeleteAccountCommand.cs`
   - `DeleteAccountCommandHandler.cs`
   - Validator yoxdur

2. Bizim layihəyə yerləşdir:
   - `Backend/Goodreads.Application/Users/Commands/DeleteAccount/`

3. Controller-də comment aç:
   - `Goodreads.API/Controllers/UsersController.cs` - 86-98 sətirlər
   - `using Goodreads.Application.Users.Commands.DeleteAccount;` əlavə et

**Bələdçi layihə yolu:** `C:\Users\HP\Desktop\goodreads-clone-master\src\Goodreads.Application\Users\Commands\DeleteAccount\`

**Bizim layihə yolu:** `Backend/Goodreads.Application/Users/Commands/DeleteAccount/`

**Qeyd:** Validator yoxdur, sadəcə Command və Handler var.

---

## 📝 ÜMUMİ TAPŞIRIQ

**Komanda üzvü üçün:**
1. **ForgotPassword** - Comment aç (5 dəq)
2. **ResetPassword** - Comment aç (5 dəq)
3. **ResetEmailConfirmation** - Bələdçi layihədən kopyala və comment aç (15-20 dəq)
4. **ChangePassword** - Bələdçi layihədən kopyala və comment aç (15-20 dəq)
5. **DeleteAccount** - Bələdçi layihədən kopyala və comment aç (15-20 dəq)

**Ümumi vaxt:** ~1 saat

**Qeyd:** Kopyaladıqdan sonra namespace-ləri yoxla, bizim layihəyə uyğun olmalıdır.

---

## ✅ Yoxlama

Hər funksiyadan sonra:
1. Build et (`dotnet build`)
2. Error-ları yoxla
3. Swagger-də endpoint görünürsə, hazırdır

