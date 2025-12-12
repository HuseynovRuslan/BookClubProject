-- Add CreatedAt and UpdatedAt columns to BookReviews table if they don't exist
-- This script will add the columns and also add the migration to the history table

-- Step 1: Add CreatedAt column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[BookReviews]') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE [BookReviews]
    ADD [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE();
    PRINT 'CreatedAt column added successfully.';
END
ELSE
BEGIN
    PRINT 'CreatedAt column already exists.';
END
GO

-- Step 2: Add UpdatedAt column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[BookReviews]') AND name = 'UpdatedAt')
BEGIN
    ALTER TABLE [BookReviews]
    ADD [UpdatedAt] datetime2 NULL;
    PRINT 'UpdatedAt column added successfully.';
END
ELSE
BEGIN
    PRINT 'UpdatedAt column already exists.';
END
GO

-- Step 3: Add migration to history table if it doesn't exist
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20251212000000_AddCreatedAtToBookReviews')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251212000000_AddCreatedAtToBookReviews', '8.0.7');
    PRINT 'Migration added to history table.';
END
ELSE
BEGIN
    PRINT 'Migration already exists in history table.';
END
GO

