import { useState, useEffect, useRef } from 'react';
import { X, Quote, BookOpen, Search, Loader2, Sparkles, Hash, Pencil } from 'lucide-react';
import { getAllBooks, getBookById } from '../api/books';
import { addQuote, updateQuote } from '../api/quotes';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get book cover URL
const getBookCoverUrl = (book) => {
  if (!book) return null;
  
  // Try OpenLibrary first
  const isbn = book.isbn || book.ISBN;
  if (isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
  }
  
  // Fallback to backend
  if (book.coverImageUrl) {
    if (book.coverImageUrl.startsWith('http')) return book.coverImageUrl;
    return `${BASE_URL}${book.coverImageUrl.startsWith('/') ? '' : '/'}${book.coverImageUrl}`;
  }
  
  return null;
};

/**
 * AddEditQuoteModal - Reusable Modal for both Creating and Editing quotes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quoteText.trim()) {
      setError('Please enter the quote text.');
      return;
    }

    // Parse tags
    const tagList = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setSubmitting(true);

    try {
      if (isEditMode) {
        // UPDATE existing quote
        await updateQuote(initialData.id, {
          text: quoteText.trim(),
          tags: tagList,
        });
        toast.success('Quote updated successfully!');
      } else {
        // CREATE new quote
        if (!selectedBook) {
          setError('Please select a book.');
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
              setError('Selected book is missing author information. Please select a different book.');
              setSubmitting(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching book details:', err);
            setError('Could not load book author information. Please try again.');
            setSubmitting(false);
            return;
          }
        }

        if (!authorId) {
          setError('Selected book is missing author information. Please select a different book.');
          setSubmitting(false);
          return;
        }

        await addQuote({
          text: quoteText.trim(),
          bookId: selectedBook.id,
          authorId: authorId,
          tags: tagList,
        });
        toast.success('Quote shared successfully!');
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
        || err.message
        || `Failed to ${isEditMode ? 'update' : 'add'} quote. Please try again.`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-b from-amber-50 to-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-amber-200/50">
        {/* Decorative pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-30 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${
              isEditMode 
                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-200' 
                : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'
            }`}>
              {isEditMode ? (
                <Pencil className="w-5 h-5 text-white" />
              ) : (
                <Quote className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {isEditMode ? 'Edit Quote' : 'Share a Quote'}
              </h2>
              <p className="text-sm text-stone-500">
                {isEditMode ? 'Update your quote' : 'Inspire the community'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative px-6 pb-6 space-y-5">
          {/* Quote Text */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Quote Text <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-amber-400/70">
                <Sparkles className="w-4 h-4" />
              </div>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder='"The only way to do great work is to love what you do."'
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 resize-none font-serif text-lg leading-relaxed"
                style={{ fontStyle: 'italic' }}
              />
            </div>
            <p className="mt-1.5 text-xs text-stone-400">
              {quoteText.length} / 500 characters
            </p>
          </div>

          {/* Book Selection (Add mode) or Book Display (Edit mode) */}
          {isEditMode ? (
            // Edit Mode - Show book as read-only
            selectedBook && (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Book <span className="text-stone-400 font-normal">(cannot be changed)</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="w-12 h-16 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                    {getBookCoverUrl(selectedBook) ? (
                      <img
                        src={getBookCoverUrl(selectedBook)}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{selectedBook.title}</p>
                    <p className="text-sm text-stone-500 truncate">{selectedBook.authorName || 'Unknown Author'}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Add Mode - Book Selection
            <div ref={dropdownRef}>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Select Book <span className="text-red-500">*</span>
              </label>
              
              {selectedBook ? (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="w-12 h-16 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                    {getBookCoverUrl(selectedBook) ? (
                      <img
                        src={getBookCoverUrl(selectedBook)}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{selectedBook.title}</p>
                    <p className="text-sm text-stone-500 truncate">{selectedBook.authorName || 'Unknown Author'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBook(null)}
                    className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 text-stone-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowBookDropdown(true);
                    }}
                    onFocus={() => setShowBookDropdown(true)}
                    placeholder="Search for a book..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  />
                  
                  {/* Dropdown */}
                  {showBookDropdown && (searchQuery.trim() || loadingBooks) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-xl z-10 max-h-64 overflow-y-auto">
                      {loadingBooks ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                          <span className="ml-2 text-sm text-stone-500">Searching...</span>
                        </div>
                      ) : books.length === 0 ? (
                        <div className="py-6 text-center">
                          <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="text-sm text-stone-500">No books found</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {books.map((book) => (
                            <button
                              key={book.id}
                              type="button"
                              onClick={() => handleBookSelect(book)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors text-left"
                            >
                              <div className="w-10 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                                {getBookCoverUrl(book) ? (
                                  <img
                                    src={getBookCoverUrl(book)}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-stone-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-stone-900 truncate text-sm">{book.title}</p>
                                <p className="text-xs text-stone-500 truncate">{book.authorName || 'Unknown Author'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-stone-400" />
                Tags <span className="text-stone-400 font-normal">(optional)</span>
              </span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="inspiration, life, wisdom"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
            />
            <p className="mt-1.5 text-xs text-stone-400">
              Separate tags with commas
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isEditMode
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200/50'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200/50'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Sharing...'}
                </>
              ) : (
                <>
                  {isEditMode ? <Pencil className="w-4 h-4" /> : <Quote className="w-4 h-4" />}
                  {isEditMode ? 'Save Changes' : 'Share Quote'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditQuoteModal;
