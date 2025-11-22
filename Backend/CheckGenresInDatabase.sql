-- Database-də Genres və BookGenres məlumatlarını yoxlamaq

-- 1. Genres table-ında neçə genre var
SELECT COUNT(*) AS GenreCount FROM Genres;

-- 2. İlk 10 genre-ni görmək
SELECT TOP 10 Id, Name, BookCount FROM Genres ORDER BY Name;

-- 3. BookGenres table-ında neçə məlumat var
SELECT COUNT(*) AS BookGenreCount FROM BookGenres;

-- 4. "A Farewell to Arms" kitabının genre-lərini yoxlamaq
SELECT 
    b.Title AS BookTitle,
    g.Name AS GenreName
FROM Books b
LEFT JOIN BookGenres bg ON b.Id = bg.BookId
LEFT JOIN Genres g ON bg.GenreId = g.Id
WHERE b.Title = 'A Farewell to Arms';

-- 5. Bütün kitabların genre-lərini görmək (ilk 10)
SELECT TOP 10
    b.Title AS BookTitle,
    g.Name AS GenreName
FROM Books b
LEFT JOIN BookGenres bg ON b.Id = bg.BookId
LEFT JOIN Genres g ON bg.GenreId = g.Id
ORDER BY b.Title;

