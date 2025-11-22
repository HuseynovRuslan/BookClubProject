-- Bu kitabların ISBN-lərini yoxlamaq üçün
SELECT Id, Title, ISBN, CoverImageUrl 
FROM Books 
WHERE Title LIKE '%Love in the Time of Cholera%' 
   OR Title LIKE '%Sense and Sensibility%'
   OR Title LIKE '%The Trial%'
   OR Title LIKE '%Mrs Dalloway%'
   OR Title LIKE '%Mrs. Dalloway%'
   OR Title LIKE '%To the Lighthouse%'
   OR Title LIKE '%Things Fall Apart%';

-- Əgər ISBN varsa, avtomatik şəkil URL-i yaratmaq üçün:
-- UPDATE Books 
-- SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/' + ISBN + '-L.jpg'
-- WHERE (Title LIKE '%Love in the Time of Cholera%' 
--    OR Title LIKE '%Sense and Sensibility%'
--    OR Title LIKE '%The Trial%'
--    OR Title LIKE '%Mrs Dalloway%'
--    OR Title LIKE '%Mrs. Dalloway%'
--    OR Title LIKE '%To the Lighthouse%'
--    OR Title LIKE '%Things Fall Apart%')
--    AND ISBN IS NOT NULL
--    AND CoverImageUrl IS NULL;

