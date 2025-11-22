-- Bu kitablar üçün şəkillər əlavə etmək (ISBN-ə görə)
-- Love in the Time of Cholera, Sense and Sensibility, The Trial, Mrs Dalloway, To the Lighthouse, Things Fall Apart

-- Love in the Time of Cholera - Gabriel García Márquez
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780307389732-L.jpg'
WHERE ISBN = '9780307389732';

-- Sense and Sensibility - Jane Austen
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780141439662-L.jpg'
WHERE ISBN = '9780141439662';

-- The Trial - Franz Kafka
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780805210408-L.jpg'
WHERE ISBN = '9780805210408';

-- Mrs Dalloway - Virginia Woolf
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780156628709-L.jpg'
WHERE ISBN = '9780156628709';

-- To the Lighthouse - Virginia Woolf
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780156907392-L.jpg'
WHERE ISBN = '9780156907392';

-- Things Fall Apart - Chinua Achebe
UPDATE Books 
SET CoverImageUrl = 'https://covers.openlibrary.org/b/isbn/9780385474542-L.jpg'
WHERE ISBN = '9780385474542';

-- Yoxlamaq üçün:
-- SELECT Id, Title, ISBN, CoverImageUrl FROM Books 
-- WHERE ISBN IN ('9780307389732', '9780141439662', '9780805210408', '9780156628709', '9780156907392', '9780385474542');

