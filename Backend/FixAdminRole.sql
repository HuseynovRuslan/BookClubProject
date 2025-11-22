-- Check admin user and roles
SELECT u.Id, u.UserName, u.Email, r.Name AS RoleName
FROM AspNetUsers u
LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
WHERE u.UserName = 'admin' OR u.Email = 'admin@goodreads.com';

-- Check if Admin role exists
SELECT * FROM AspNetRoles WHERE Name = 'Admin';

-- Fix admin user role
-- First, get the admin user ID and Admin role ID
DECLARE @AdminUserId NVARCHAR(450);
DECLARE @AdminRoleId NVARCHAR(450);

SELECT @AdminUserId = Id FROM AspNetUsers WHERE UserName = 'admin' OR Email = 'admin@goodreads.com';
SELECT @AdminRoleId = Id FROM AspNetRoles WHERE Name = 'Admin';

-- Remove all existing roles from admin user
DELETE FROM AspNetUserRoles WHERE UserId = @AdminUserId;

-- Add Admin role to admin user
IF @AdminUserId IS NOT NULL AND @AdminRoleId IS NOT NULL
BEGIN
    INSERT INTO AspNetUserRoles (UserId, RoleId)
    VALUES (@AdminUserId, @AdminRoleId);
    PRINT 'Admin role assigned successfully';
END
ELSE
BEGIN
    PRINT 'Admin user or Admin role not found';
END

-- Verify the fix
SELECT u.Id, u.UserName, u.Email, r.Name AS RoleName
FROM AspNetUsers u
LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
WHERE u.UserName = 'admin' OR u.Email = 'admin@goodreads.com';

