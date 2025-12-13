# Migration Fix Instructions - Remove CreatedAt from Books

## Problem
Database-də `CreatedAt` sütunu var, amma kodda artıq yoxdur. Bu uyğunsuzluq yaradır.

## Həll Yolları

### Seçim 1: SQL Script (Tövsiyə olunur) ✅

Əgər database-də `CreatedAt` sütunu varsa, SQL script-i işə salın:

```bash
sqlcmd -S "DESKTOP-20QTB3S\SQLEXPRESS" -d "GoodReads" -E -i "Backend/remove_createdat_from_books.sql"
```

Və ya SQL Server Management Studio-da script-i açıb işə salın.

**Nə edir:**
- `CreatedAt` sütunundakı default constraint-i silir
- `CreatedAt` sütununu `Books` cədvəlindən silir
- Migration-ı history-yə əlavə edir

**Üstünlükləri:**
- ✅ Datalar saxlanılır
- ✅ Production-da istifadə oluna bilər
- ✅ Tez və təhlükəsiz

---

### Seçim 2: Database-i silib yenidən yaratmaq ⚠️

**Yalnız development environment üçün!**

```bash
# 1. Database-i sil
sqlcmd -S "DESKTOP-20QTB3S\SQLEXPRESS" -E -Q "DROP DATABASE GoodReads;"

# 2. Database-i yenidən yarat
sqlcmd -S "DESKTOP-20QTB3S\SQLEXPRESS" -E -Q "CREATE DATABASE GoodReads;"

# 3. Bütün migration-ları tətbiq et
cd Backend
dotnet ef database update --project Goodreads.Infrastructure --startup-project Goodreads.API
```

**Nə edir:**
- Bütün database-i silir
- Database-i sıfırdan yaradır
- Bütün migration-ları tətbiq edir

**Mənfi cəhətləri:**
- ❌ **Bütün datalar itirilir** (users, books, reviews, və s.)
- ❌ Production-da istifadə oluna bilməz
- ❌ Digər developer-lərin dataları da itirilir (shared database-dirsə)

**Nə vaxt istifadə olunur:**
- ✅ Yalnız development environment
- ✅ Test dataları vacib deyilsə
- ✅ Database tamamilə xarab olubsa

---

## Tövsiyə

**Development üçün:** SQL Script istifadə edin (Seçim 1) ✅

**Production üçün:** Mütləq SQL Script istifadə edin (Seçim 1) ✅

**Yalnız test/development və datalar vacib deyilsə:** Database-i silib yenidən yarada bilərsiniz (Seçim 2) ⚠️

---

## Yoxlama

Migration-ın tətbiq olunub-olunmadığını yoxlamaq üçün:

```sql
-- CreatedAt sütununun olub-olmadığını yoxla
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Books' AND COLUMN_NAME = 'CreatedAt';
-- Nəticə boş olmalıdır

-- Migration history-də olub-olmadığını yoxla
SELECT * FROM [__EFMigrationsHistory] 
WHERE MigrationId = '20251212130000_RemoveCreatedAtFromBooks';
-- Nəticə göstərilməlidir
```

