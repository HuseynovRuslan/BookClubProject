import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookCard from '../components/BookCard';
import { getAllBooks } from '../api/books';
import { Button, EmptyState, Eyebrow, LoadingState, Pagination, SearchField } from '../components/app/ui';
import '../styles/app/books.css';

const pageSize = 12;

const BrowseBooksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = (searchParams.get('search') || '').trim();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  // What the search field shows; the server search always uses the ?search= value from the URL.
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const requestRef = useRef(0);

  // Read search query from URL (also when it changes from outside, e.g. back/forward)
  useEffect(() => {
    setSearchQuery((current) => (current.trim() === urlQuery ? current : urlQuery));
    setCurrentPage(1); // Reset to first page when search changes
  }, [urlQuery]);

  const fetchBooks = useCallback(async (page, query = '') => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      setLoadError(false);
      const response = await getAllBooks(page, pageSize, query || null);
      if (requestId !== requestRef.current) return; // a newer search already replaced this one

      setBooks(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      console.error('Error fetching books:', error);
      setLoadError(true);
      toast.error('Kitablar yüklənmədi. Yenidən cəhd et.');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(currentPage, urlQuery);
  }, [currentPage, urlQuery, fetchBooks]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    const search = params.toString();
    navigate(`/books${search ? `?${search}` : ''}`, { replace: true });
    setCurrentPage(1); // Reset to first page on search
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="page books-page">
      <header className="page-hero books-hero">
        <Eyebrow>KİTAB KƏŞFİ</Eyebrow>
        <h1>
          <span className="heading-line">Yeni dünyalara</span>
          <span className="heading-line">açılan rəflər.</span>
        </h1>
        <p>Azərbaycan və dünya ədəbiyyatından seçilmiş hekayələri kəşf et.</p>
        <form onSubmit={(event) => event.preventDefault()} role="search">
          <SearchField
            label="Kitab axtar"
            large
            onChange={handleSearchChange}
            placeholder="Kitab, müəllif və ya janr axtar..."
            type="search"
            value={searchQuery}
          />
        </form>
      </header>

      <div className="filter-row">
        <p aria-live="polite" className="results-summary">
          {loading ? (
            'Kitablar yüklənir...'
          ) : loadError || books.length === 0 ? (
            ''
          ) : (
            <>
              {urlQuery ? (
                <>
                  “<strong>{urlQuery}</strong>” üzrə {totalCount} kitab tapıldı
                </>
              ) : (
                <>
                  <strong>
                    {firstShown}–{lastShown}
                  </strong>{' '}
                  arası göstərilir
                </>
              )}
              {' · '}Səhifə {currentPage} / {totalPages}
            </>
          )}
        </p>
        {!loading && !loadError && books.length > 0 && <span>{totalCount} nəticə</span>}
      </div>

      {loading ? (
        <LoadingState count={10} />
      ) : loadError ? (
        <EmptyState
          action={<Button onClick={() => fetchBooks(currentPage, urlQuery)}>Yenidən cəhd et</Button>}
          text="Bağlantını yoxlayıb yenidən cəhd et."
          title="Kitablar yüklənmədi"
        />
      ) : books.length > 0 ? (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard book={book} key={book.id} />
            ))}
          </div>
          <Pagination onChange={goToPage} page={currentPage} totalPages={totalPages} />
        </>
      ) : urlQuery ? (
        <EmptyState
          action={<Button onClick={() => handleSearchChange('')}>Axtarışı təmizlə</Button>}
          text="Başqa söz və ya müəllif adı ilə yenidən axtar."
          title="Bu axtarışa uyğun kitab tapılmadı"
        />
      ) : (
        <EmptyState text="Kitablar əlavə olunduqca burada görünəcək." title="Kataloqda hələ kitab yoxdur" />
      )}
    </div>
  );
};

export default BrowseBooksPage;
