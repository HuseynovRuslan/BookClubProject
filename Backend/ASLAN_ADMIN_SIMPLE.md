# Aslan üçün Admin Yaratmaq - Sadə Yol

## Variant 1: Register + SQL (Ən Sadə)

1. **Aslan özü register olsun:**
   - Frontend-dən və ya Postman-dən: `POST /api/auth/register`
   - Email: `aslan@goodreads.com`
   - Password: istədiyi şifrə

2. **Sonra SQL ilə Admin role-u ver:**
```sql
-- Aslan-ın ID-sini tap
DECLARE @AslanId NVARCHAR(450);
SELECT @AslanId = Id FROM AspNetUsers WHERE Email = 'aslan@goodreads.com';

-- Admin role ID-sini tap
DECLARE @AdminRoleId NVARCHAR(450);
SELECT @AdminRoleId = Id FROM AspNetRoles WHERE Name = 'Admin';

-- Admin role-u ver
INSERT INTO AspNetUserRoles (UserId, RoleId)
VALUES (@AslanId, @AdminRoleId);
```

## Variant 2: RolesSeeder-ə Əlavə Et

**Fayl**: `Goodreads.Infrastructure/Persistence/Seeders/RolesSeeder.cs`

```csharp
// Aslan üçün admin user
if (!await dbContext.Users.AnyAsync(u => u.UserName == "aslan"))
{
    var aslanUser = new User
    {
        UserName = "aslan",
        Email = "aslan@goodreads.com",
    };
    var createResult = await userManager.CreateAsync(aslanUser, "Aslan123!");
    if (createResult.Succeeded)
    {
        await userManager.AddToRoleAsync(aslanUser, Roles.Admin);
    }
}
```

Sonra backend-i restart et - seeder avtomatik işləyəcək.

## Variant 3: Swagger-dən Test Et

1. `POST /api/auth/register` - Aslan register olsun
2. SQL ilə role ver (Variant 1-dəki SQL)

---

**Tövsiyə**: Variant 1 ən sadədir - register olsun, sonra SQL ilə role ver.







