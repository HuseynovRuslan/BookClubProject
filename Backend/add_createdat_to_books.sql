-- Add CreatedAt column to Books table if it doesn't exist
-- This script will add the column and also add the migration to the history table

-- Step 1: Add CreatedAt column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Books]') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE [Books]
    ADD [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE();
    PRINT 'CreatedAt column added to Books table successfully.';
END
ELSE
BEGIN
    PRINT 'CreatedAt column already exists in Books table.';
END
GO

-- Step 2: Add migration to history table if it doesn't exist
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20251212000001_AddCreatedAtToBooks')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251212000001_AddCreatedAtToBooks', '8.0.7');
    PRINT 'Migration added to history table.';
END
ELSE
BEGIN
    PRINT 'Migration already exists in history table.';
END
GO

