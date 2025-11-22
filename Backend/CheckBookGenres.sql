-- Database-də BookGenres məlumatlarını yoxlamaq
-- "A Farewell to Arms" kitabının genre-lərini yoxlamaq

-- 1. Kitabın ID-sini tapmaq
SELECT Id, Title FROM Books WHERE Title = 'A Farewell to Arms';

-- 2. BookGenres table-ında bu kitab üçün məlumat var yoxsa yox
SELECT 
    bg.Id,
    bg.BookId,
    bg.GenreId,
    b.Title AS BookTitle,
    g.Name AS GenreName
FROM BookGenres bg
INNER JOIN Books b ON bg.BookId = b.Id
LEFT JOIN Genres g ON bg.GenreId = g.Id
WHERE b.Title = 'A Farewell to Arms';

-- 3. Genres table-ında neçə genre var
SELECT COUNT(*) AS GenreCount FROM Genres;

-- 4. BookGenres table-ında neçə məlumat var
SELECT COUNT(*) AS BookGenreCount FROM BookGenres;

-- 5. Bütün kitabların genre-lərini görmək
SELECT 
    b.Title AS BookTitle,
    g.Name AS GenreName
FROM Books b
LEFT JOIN BookGenres bg ON b.Id = bg.BookId
LEFT JOIN Genres g ON bg.GenreId = g.Id
ORDER BY b.Title;

