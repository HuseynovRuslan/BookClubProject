import { useState, useEffect, useRef } from 'react';
import { getAllBooks, getBookById } from '../api/books';
import { addQuote, updateQuote } from '../api/quotes';
import { toast } from 'react-toastify';
import { BookCover, Button, Dialog, Eyebrow, Icon } from './app/ui';
import { bookAuthor } from './app/format';

/**
 * AddEditQuoteModal - Reusable Modal for both Creating and Editing quotes (design-system Dialog)
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} mode - 'add' or 'edit'
 * @param {object} initialData - null for add, quote object for edit
 * @param {function} onSuccess - Callback when quote is successfully added/updated
 */
const AddEditQuoteModal = ({ isOpen, onClose, mode = 'add', initialData = null, onSuccess }) => {
  // Form state
  const [quoteText, setQuoteText] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [tags, setTags] = useState('');

  // Book search state (only for add mode)
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const isEditMode = mode === 'edit';

  // Initialize form when modal opens or mode/data changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        // Edit mode - populate with existing data
        setQuoteText(initialData.text || '');
        setTags(initialData.tags?.join(', ') || '');

        // Set the book from initialData (read-only in edit mode)
        if (initialData.book) {
          setSelectedBook({
            id: initialData.bookId,
            title: initialData.book.title,
            authorName: initialData.book.authorName || initialData.book.author?.name,
            coverImageUrl: initialData.book.coverImageUrl,
            isbn: initialData.book.isbn,
            authorId: initialData.authorId,
          });
        }
      } else {
        // Add mode - reset form
        setQuoteText('');
        setSelectedBook(null);
        setTags('');
        setSearchQuery('');
      }
      setError('');
    }
  }, [isOpen, mode, initialData, isEditMode]);

  // Fetch books when search query changes (add mode only)
  useEffect(() => {
    if (isEditMode) return; // Skip book search in edit mode

    const searchBooks = async () => {
      if (!searchQuery.trim()) {
        setBooks([]);
        return;
      }

      setLoadingBooks(true);
      try {
        // Use server-side search with max pageSize (50) - much more efficient!
        const response = await getAllBooks(1, 50, searchQuery.trim());
        const allBooks = response?.items || response?.data || response || [];

        // Show up to 8 results (already filtered by backend)
        setBooks(allBooks.slice(0, 8));
      } catch (err) {
        console.error('Error searching books:', err);
        // If error, show empty results instead of crashing
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    const debounce = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isEditMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowBookDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookSelect = async (book) => {
    // Handle both camelCase and PascalCase property names
    const authorId = book.authorId || book.AuthorId;

    // If book doesn't have authorId, fetch full book details
    if (!authorId && book.id) {
      try {
        const fullBook = await getBookById(book.id);
        const fetchedAuthorId = fullBook?.author?.id || fullBook?.Author?.Id;
        if (fetchedAuthorId) {
          setSelectedBook({
            ...book,
            authorId: fetchedAuthorId,
          });
        } else {
          setSelectedBook(book);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setSelectedBook(book);
      }
    } else {
      setSelectedBook({
        ...book,
        authorId: authorId,
      });
    }
    setSearchQuery('');
    setShowBookDropdown(false);
  };

  const clearSelectedBook = () => {
    setSelectedBook(null);
    // Give focus back to the book search that replaces the selected book.
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quoteText.trim()) {
      setError('Sitatın mətnini yaz.');
      return;
    }

    // Parse tags
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setSubmitting(true);

    try {
      if (isEditMode) {
        // UPDATE existing quote
        await updateQuote(initialData.id, {
          text: quoteText.trim(),
          tags: tagList,
        });
        toast.success('Sitat yeniləndi!');
      } else {
        // CREATE new quote
        if (!selectedBook) {
          setError('Kitab seç.');
          setSubmitting(false);
          return;
        }

        // Get authorId
        let authorId = selectedBook.authorId;
        if (!authorId && selectedBook.id) {
          try {
            const fullBook = await getBookById(selectedBook.id);
            authorId = fullBook?.author?.id;
            if (!authorId) {
              setError('Seçdiyin kitabın müəllif məlumatı yoxdur. Başqa kitab seç.');
              setSubmitting(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching book details:', err);
            setError('Müəllif məlumatını yükləmək alınmadı. Yenidən cəhd et.');
            setSubmitting(false);
            return;
          }
        }

        if (!authorId) {
          setError('Seçdiyin kitabın müəllif məlumatı yoxdur. Başqa kitab seç.');
          setSubmitting(false);
          return;
        }

        await addQuote({
          text: quoteText.trim(),
          bookId: selectedBook.id,
          authorId: authorId,
          tags: tagList,
        });
        toast.success('Sitat paylaşıldı!');
      }

      // Success - close modal and trigger refresh
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving quote:', err);
      const errorMessage = err.response?.data?.message
        || err.response?.data?.errors?.AuthorId?.[0]
        || err.response?.data?.errors?.BookId?.[0]
        || err.response?.data?.errors?.Text?.[0]
        || `Sitatı ${isEditMode ? 'yeniləmək' : 'paylaşmaq'} alınmadı. Yenidən cəhd et.`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedBookRow = selectedBook && (
    <div className="selected-book">
      <BookCover book={selectedBook} className="cover-thumb" />
      <span>
        <strong>{selectedBook.title}</strong>
        <small>{bookAuthor(selectedBook) || 'Müəllif məlum deyil'}</small>
      </span>
      {!isEditMode && (
        <button aria-label="Seçilmiş kitabı dəyiş" onClick={clearSelectedBook} type="button">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );

  return (
    <Dialog className="dash-modal-wide" labelledBy="quote-modal-title" onClose={() => !submitting && onClose()}>
      <Eyebrow>{isEditMode ? 'Sitatı redaktə et' : 'Yeni sitat'}</Eyebrow>
      <h2 id="quote-modal-title">{isEditMode ? 'Sitatını yenilə' : 'Sevdiyin sətri paylaş'}</h2>
      <p>{isEditMode ? 'Mətni və teqləri dəyişə bilərsən.' : 'Oxuduğun kitabdan səni düşündürən bir parçanı icma ilə bölüş.'}</p>

      <form className="quote-form" noValidate onSubmit={handleSubmit}>
        {/* Quote Text */}
        <label className="text-field">
          Sitat
          <textarea
            aria-describedby="quote-text-count"
            aria-required="true"
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="“Ən vacib şey gözə görünməz.”"
            rows={4}
            value={quoteText}
          />
          <span className="field-hint" id="quote-text-count">
            {quoteText.length} / 500 simvol
          </span>
        </label>

        {/* Book Selection (Add mode) or Book Display (Edit mode) */}
        {isEditMode ? (
          selectedBook && (
            <div className="text-field">
              <span>
                Kitab <span className="field-label-note">(dəyişdirilə bilməz)</span>
              </span>
              {selectedBookRow}
            </div>
          )
        ) : (
          <div className="text-field" ref={dropdownRef}>
            {selectedBook ? (
              <>
                <span>Kitab</span>
                {selectedBookRow}
              </>
            ) : (
              <>
                <label htmlFor="quote-book-search">Kitab</label>
                <input
                  aria-controls="quote-book-results"
                  aria-expanded={showBookDropdown && Boolean(searchQuery.trim())}
                  aria-required="true"
                  autoComplete="off"
                  id="quote-book-search"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowBookDropdown(true);
                  }}
                  onFocus={() => setShowBookDropdown(true)}
                  placeholder="Kitab adı və ya müəllif axtar…"
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                />

                {showBookDropdown && (searchQuery.trim() || loadingBooks) && (
                  loadingBooks ? (
                    <p aria-live="polite" className="book-picker-status" role="status">
                      Axtarılır…
                    </p>
                  ) : books.length === 0 ? (
                    <p aria-live="polite" className="book-picker-status" role="status">
                      Kitab tapılmadı
                    </p>
                  ) : (
                    <ul aria-label="Axtarış nəticələri" className="book-picker-results" id="quote-book-results">
                      {books.map((book) => (
                        <li key={book.id}>
                          <button onClick={() => handleBookSelect(book)} type="button">
                            <BookCover book={book} className="cover-thumb" />
                            <span>
                              <strong>{book.title}</strong>
                              <small>{bookAuthor(book) || 'Müəllif məlum deyil'}</small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </>
            )}
          </div>
        )}

        {/* Tags */}
        <label className="text-field">
          <span>
            Teqlər <span className="field-label-note">(istəyə bağlı)</span>
          </span>
          <input
            aria-describedby="quote-tags-hint"
            onChange={(e) => setTags(e.target.value)}
            placeholder="ilham, həyat, sevgi"
            type="text"
            value={tags}
          />
          <span className="field-hint" id="quote-tags-hint">
            Teqləri vergüllə ayır
          </span>
        </label>

        {/* Error Message */}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <Button disabled={submitting} onClick={onClose} variant="secondary">
            Ləğv et
          </Button>
          <Button disabled={submitting} type="submit">
            {isEditMode ? <Icon name="check" size={16} /> : <Icon name="send" size={16} />}
            {submitting
              ? isEditMode
                ? 'Saxlanılır…'
                : 'Paylaşılır…'
              : isEditMode
                ? 'Dəyişiklikləri saxla'
                : 'Sitatı paylaş'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddEditQuoteModal;
