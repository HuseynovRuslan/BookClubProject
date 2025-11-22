-- GoodReads database-də CoverImageUrl-ləri update etmək
-- ISBN-i olan bütün kitablar üçün

USE GoodReads;
GO

-- CoverImageUrl-ləri update etmək
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/' + ISBN + '-L.jpg'
WHERE ISBN IS NOT NULL 
  AND ISBN != ''
  AND (CoverImageUrl IS NULL OR CoverImageUrl = '');

-- Yoxlamaq - neçə kitab update edildi
SELECT 
    COUNT(*) AS TotalBooks,
    SUM(CASE WHEN CoverImageUrl IS NULL OR CoverImageUrl = '' THEN 1 ELSE 0 END) AS NullOrEmpty,
    SUM(CASE WHEN CoverImageUrl IS NOT NULL AND CoverImageUrl != '' THEN 1 ELSE 0 END) AS HasValue
FROM Books;

-- İlk 10 kitabın CoverImageUrl-ini görmək
SELECT TOP 10
    Id,
    Title,
    ISBN,
    CoverImageUrl
FROM Books
ORDER BY Title;

PRINT 'CoverImageUrl-lər update edildi!';

