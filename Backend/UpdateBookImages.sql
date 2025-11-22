-- Mövcud kitablar üçün şəkillər əlavə etmək (Open Library API-dən)
-- ISBN-ə görə şəkilləri update edir

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg'
WHERE ISBN = '9780743273565';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg'
WHERE ISBN = '9780451524935';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg'
WHERE ISBN = '9780451526342';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg'
WHERE ISBN = '9780439708180';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780439064873-L.jpg'
WHERE ISBN = '9780439064873';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg'
WHERE ISBN = '9780547928227';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg'
WHERE ISBN = '9780618640157';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780062693662-L.jpg'
WHERE ISBN = '9780062693662';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg'
WHERE ISBN = '9780062073488';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg'
WHERE ISBN = '9780061120084';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780307743657-L.jpg'
WHERE ISBN = '9780307743657';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg'
WHERE ISBN = '9781501142970';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg'
WHERE ISBN = '9780307474278';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9781416524793-L.jpg'
WHERE ISBN = '9781416524793';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg'
WHERE ISBN = '9780062315007';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780143105626-L.jpg'
WHERE ISBN = '9780143105626';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141439280-L.jpg'
WHERE ISBN = '9780141439280';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141396474-L.jpg'
WHERE ISBN = '9780141396474';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141396504-L.jpg'
WHERE ISBN = '9780141396504';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141396313-L.jpg'
WHERE ISBN = '9780141396313';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg'
WHERE ISBN = '9780141439518';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141439587-L.jpg'
WHERE ISBN = '9780141439587';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780486280615-L.jpg'
WHERE ISBN = '9780486280615';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780143039563-L.jpg'
WHERE ISBN = '9780143039563';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg'
WHERE ISBN = '9780684801223';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780684801469-L.jpg'
WHERE ISBN = '9780684801469';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780199232765-L.jpg'
WHERE ISBN = '9780199232765';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780143035008-L.jpg'
WHERE ISBN = '9780143035008';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780143058144-L.jpg'
WHERE ISBN = '9780143058144';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780374528379-L.jpg'
WHERE ISBN = '9780374528379';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg'
WHERE ISBN = '9780060883287';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg'
WHERE ISBN = '9780553213690';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg'
WHERE ISBN = '9780375704024';

UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9781400079278-L.jpg'
WHERE ISBN = '9781400079278';

-- Yoxlamaq üçün:
-- SELECT Id, Title, ISBN, CoverImageUrl FROM Books WHERE CoverImageUrl IS NOT NULL;

