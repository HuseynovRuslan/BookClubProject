# Migration Instructions

## Yeni Migration-lar

Aşağıdakı migration-lar yaradılıb və tətbiq olunmalıdır:

1. **20251212000000_AddCreatedAtToBookReviews** - `BookReviews` cədvəlinə `CreatedAt` və `UpdatedAt` sütunları əlavə edir
2. **20251212000001_AddCreatedAtToBooks** - `Books` cədvəlinə `CreatedAt` sütunu əlavə edir

## Tətbiq etmək üçün

### Seçim 1: Entity Framework Migration (Tövsiyə olunur)

```bash
cd Backend
dotnet ef database update --project Goodreads.Infrastructure --startup-project Goodreads.API
```

### Seçim 2: SQL Script (Əgər migration işləmirsə)

SQL script-ləri `Backend/` qovluğunda mövcuddur:
- `add_createdat_to_bookreviews.sql`
- `add_createdat_to_books.sql`

Bu script-ləri SQL Server Management Studio və ya başqa SQL client-də işə salın.

## Qeyd

Əgər migration-lar artıq tətbiq olunubsa (migration history-də varsa), `dotnet ef database update` heç nə etməyəcək. Bu normaldır.

## Yoxlamaq üçün

Migration-ların tətbiq olunub-olunmadığını yoxlamaq üçün:

```sql
SELECT * FROM [__EFMigrationsHistory] 
WHERE MigrationId IN ('20251212000000_AddCreatedAtToBookReviews', '20251212000001_AddCreatedAtToBooks');
```

Və ya sütunların mövcudluğunu yoxlamaq üçün:

```sql
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'BookReviews' AND COLUMN_NAME IN ('CreatedAt', 'UpdatedAt');

SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Books' AND COLUMN_NAME = 'CreatedAt';
```


root