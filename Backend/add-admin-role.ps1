# PowerShell script to add Admin role to a user
# Usage: .\add-admin-role.ps1 -Email "your-email@example.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

Write-Host "Adding Admin role to user: $Email" -ForegroundColor Yellow

# Database connection string - appsettings.json-dan götürülüb
$connectionString = "Data Source=DESKTOP-20QTB3S\SQLEXPRESS;Initial Catalog=GoodReads;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False"

try {
    # SQL query
    $query = @"
DECLARE @UserId NVARCHAR(450);
DECLARE @RoleId NVARCHAR(450);

SELECT @UserId = Id FROM AspNetUsers WHERE Email = '$Email';
SELECT @RoleId = Id FROM AspNetRoles WHERE Name = 'Admin';

IF @UserId IS NULL
BEGIN
    PRINT 'İstifadəçi tapılmadı: $Email';
    RETURN;
END

IF @RoleId IS NULL
BEGIN
    PRINT 'Admin role-u tapılmadı. Əvvəlcə RolesSeeder-i işlədin.';
    RETURN;
END

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
"@

    # Execute SQL query
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $connection.Open()
    
    $reader = $command.ExecuteReader()
    while ($reader.Read()) {
        Write-Host $reader[0] -ForegroundColor Green
    }
    
    $connection.Close()
    Write-Host "`nTamamlandı! İndi '$Email' hesabı ilə daxil olun və Admin Panel linkini görəcəksiniz." -ForegroundColor Green
}
catch {
    Write-Host "Xəta: $_" -ForegroundColor Red
    Write-Host "`nConnection string-i yoxlayın və database-in işlədiyini təsdiq edin." -ForegroundColor Yellow
}

