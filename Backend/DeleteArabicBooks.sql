-- Ərəb dilində olan kitabları silmək üçün SQL sorğusu
-- İlk öncə əlaqəli cədvəllərdən məlumatları silmək lazımdır (foreign key constraints)

-- 1. BookGenres cədvəlindən sil
DELETE FROM BookGenres 
WHERE BookId IN (SELECT Id FROM Books WHERE Language = 'Arabic' OR Language LIKE '%Arabic%' OR Language LIKE '%عربي%');

-- 2. BookShelves cədvəlindən sil
DELETE FROM BookShelves 
WHERE BookId IN (SELECT Id FROM Books WHERE Language = 'Arabic' OR Language LIKE '%Arabic%' OR Language LIKE '%عربي%');

-- 3. BookReviews cədvəlindən sil
DELETE FROM BookReviews 
WHERE BookId IN (SELECT Id FROM Books WHERE Language = 'Arabic' OR Language LIKE '%Arabic%' OR Language LIKE '%عربي%');

-- 4. Son olaraq Books cədvəlindən sil
DELETE FROM Books 
WHERE Language = 'Arabic' OR Language LIKE '%Arabic%' OR Language LIKE '%عربي%';

-- Yoxlamaq üçün:
-- SELECT * FROM Books WHERE Language = 'Arabic' OR Language LIKE '%Arabic%' OR Language LIKE '%عربي%';

