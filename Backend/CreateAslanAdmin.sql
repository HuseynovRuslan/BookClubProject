-- Aslan üçün Admin user yaratmaq

-- 1. İstifadəçi yarat (əgər yoxdursa)
IF NOT EXISTS (SELECT * FROM AspNetUsers WHERE UserName = 'aslan' OR Email = 'aslan@goodreads.com')
BEGIN
    INSERT INTO AspNetUsers (Id, UserName, Email, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnabled, AccessFailedCount)
    VALUES (
        NEWID(),
        'aslan',
        'aslan@goodreads.com',
        1,
        -- Password: Aslan123! (hash edilmiş)
        'AQAAAAIAAYagAAAAE...', -- Bu hash-i Identity-dən almalısan
        NEWID(),
        NEWID(),
        0,
        0,
        1,
        0
    );
END

-- 2. Admin role-u tap
DECLARE @AdminRoleId NVARCHAR(450);
SELECT @AdminRoleId = Id FROM AspNetRoles WHERE Name = 'Admin';

-- 3. Aslan-ın ID-sini tap
DECLARE @AslanUserId NVARCHAR(450);
SELECT @AslanUserId = Id FROM AspNetUsers WHERE UserName = 'aslan' OR Email = 'aslan@goodreads.com';

-- 4. Admin role-u ver
IF @AslanUserId IS NOT NULL AND @AdminRoleId IS NOT NULL
BEGIN
    -- Köhnə role-ları sil
    DELETE FROM AspNetUserRoles WHERE UserId = @AslanUserId;
    
    -- Admin role-u əlavə et
    INSERT INTO AspNetUserRoles (UserId, RoleId)
    VALUES (@AslanUserId, @AdminRoleId);
    
    PRINT 'Aslan admin role-u verildi!';
END
ELSE
BEGIN
    PRINT 'Xəta: Aslan user və ya Admin role tapılmadı!';
END







