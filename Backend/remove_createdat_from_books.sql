-- Remove CreatedAt column from Books table if it exists
-- This script will remove the column and also add the migration to the history table

-- Step 1: Remove default constraint if it exists
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('Books') 
AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('Books'), 'CreatedAt', 'ColumnId');

IF @ConstraintName IS NOT NULL
BEGIN
    DECLARE @DropConstraintSQL NVARCHAR(MAX) = 'ALTER TABLE [Books] DROP CONSTRAINT [' + @ConstraintName + ']';
    EXEC sp_executesql @DropConstraintSQL;
    PRINT 'Default constraint removed successfully.';
END
GO

-- Step 2: Remove CreatedAt column if it exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Books]') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE [Books]
    DROP COLUMN [CreatedAt];
    PRINT 'CreatedAt column removed from Books table successfully.';
END
ELSE
BEGIN
    PRINT 'CreatedAt column does not exist in Books table.';
END
GO

-- Step 3: Add migration to history table if it doesn't exist
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20251212130000_RemoveCreatedAtFromBooks')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251212130000_RemoveCreatedAtFromBooks', '8.0.7');
    PRINT 'Migration added to history table.';
END
ELSE
BEGIN
    PRINT 'Migration already exists in history table.';
END
GO

