-- Bu script-i istifadə edərək istənilən istifadəçiyə Admin role-u verə bilərsiniz
-- İstifadəçinin email-ini dəyişdirin

-- 1. İstifadəçinin ID-sini tapın
DECLARE @UserId NVARCHAR(450);
SELECT @UserId = Id FROM AspNetUsers WHERE Email = 'your-email@example.com'; -- BURANI DƏYİŞDİRİN

-- 2. Admin role-unun ID-sini tapın
DECLARE @RoleId NVARCHAR(450);
SELECT @RoleId = Id FROM AspNetRoles WHERE Name = 'Admin';

-- 3. İstifadəçiyə Admin role-u verin (əgər artıq yoxdursa)
IF NOT EXISTS (SELECT 1 FROM AspNetUserRoles WHERE UserId = @UserId AND RoleId = @RoleId)
BEGIN
    INSERT INTO AspNetUserRoles (UserId, RoleId)
    VALUES (@UserId, @RoleId);
    PRINT 'Admin role-u uğurla əlavə edildi!';
END
ELSE
BEGIN
    PRINT 'İstifadəçi artıq Admin role-unə malikdir.';
END

