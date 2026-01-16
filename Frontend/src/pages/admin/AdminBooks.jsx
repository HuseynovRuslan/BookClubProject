import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Image as ImageIcon,
  Upload,
  Pencil,
} from 'lucide-react';
import { getAllBooksAdmin, createBook, updateBook, deleteBookAdmin } from '../../api/admin';
import { getAllAuthors, getAllGenres } from '../../api/admin';
import { addGenresToBook } from '../../api/books';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  // Form dropdown data
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publicationDate: '',
    language: 'English',
    pageCount: '',
    publisher: '',
    authorId: '',
    genreIds: [], // Array of selected genre IDs
    coverImage: null,
  });
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm]);

  useEffect(() => {
    if (showModal) {
      fetchAuthorsAndGenres();
    }
  }, [showModal]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getAllBooksAdmin(page, pageSize, searchTerm);
      setBooks(data?.items || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorsAndGenres = async () => {
    try {
      const [authorsData, genresData] = await Promise.all([
        getAllAuthors(1, 100),
        getAllGenres(1, 100),
      ]);
      setAuthors(authorsData?.items || []);
      setGenres(genresData?.items || []);
    } catch (error) {
      console.error('Error fetching authors/genres:', error);
      toast.error(`Failed to load authors/genres: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = async (book) => {
    // Load authors before opening edit modal
    await fetchAuthorsAndGenres();
    
    setEditingId(book.id);
    setFormData({
      title: book.title || '',
      description: book.description || '',
      isbn: book.isbn || '',
      publicationDate: book.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : '',
      language: book.language || 'English',
      pageCount: book.pageCount?.toString() || '',
      publisher: book.publisher || '',
      authorId: book.authorId || book.author?.id || '',
      genreIds: book.genres?.map(g => g.id || g) || [],
      coverImage: null,
    });
    if (book.coverImageUrl || book.coverImage) {
      setCoverPreview(getImageUrl(book.coverImageUrl || book.coverImage));
    } else {
      setCoverPreview(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.authorId) {
      toast.error('Title and Author are required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      
      if (editingId) {
        // Update mode
        submitData.append('Id', editingId);
        if (formData.title) submitData.append('Title', formData.title);
        if (formData.description) submitData.append('Description', formData.description);
        if (formData.isbn) submitData.append('ISBN', formData.isbn);
        if (formData.publicationDate) submitData.append('PublicationDate', formData.publicationDate);
        if (formData.language) submitData.append('Language', formData.language);
        if (formData.pageCount) submitData.append('PageCount', formData.pageCount);
        if (formData.publisher) submitData.append('Publisher', formData.publisher);
        if (formData.authorId) submitData.append('AuthorId', formData.authorId);
        if (formData.coverImage) {
          submitData.append('CoverImage', formData.coverImage);
        }

        await updateBook(submitData);
        
        // Update genres if changed
        if (formData.genreIds && formData.genreIds.length >= 0) {
          try {
            // First, get current book to see existing genres
            // For simplicity, we'll just add the selected genres
            // Note: This will add genres, not replace. For full replacement, we'd need to remove existing first.
            if (formData.genreIds.length > 0) {
              await addGenresToBook(editingId, formData.genreIds);
            }
          } catch (genreError) {
            console.error('Error updating genres:', genreError);
            // Don't fail the whole operation if genres fail
            toast.warning('Book updated but genres may not have been updated');
          }
        }
        
        toast.success('Book updated successfully');
      } else {
        // Create mode
        submitData.append('Title', formData.title);
        submitData.append('Description', formData.description);
        submitData.append('ISBN', formData.isbn);
        submitData.append('PublicationDate', formData.publicationDate);
        submitData.append('Language', formData.language);
        submitData.append('PageCount', formData.pageCount || '0');
        submitData.append('Publisher', formData.publisher);
        submitData.append('AuthorId', formData.authorId);
        if (formData.coverImage) {
          submitData.append('CoverImage', formData.coverImage);
        }

        const result = await createBook(submitData);
        // Extract bookId from Location header (CreatedAtAction returns Location header)
        let bookId = null;
        if (result?.headers?.location) {
          const locationMatch = result.headers.location.match(/\/books\/get-book-by-id\/([^\/]+)/);
          if (locationMatch) {
            bookId = locationMatch[1];
          }
        }
        
        // Fallback: try to get from response data if Location header doesn't have it
        if (!bookId && result?.data) {
          bookId = result.data;
        }
        
        // Add genres to the book if any are selected
        if (formData.genreIds && formData.genreIds.length > 0 && bookId) {
          try {
            await addGenresToBook(bookId, formData.genreIds);
          } catch (genreError) {
            console.error('Error adding genres:', genreError);
            // Don't fail the whole operation if genres fail
            toast.warning('Book created but some genres may not have been added');
          }
        }
        
        toast.success('Book created successfully');
      }
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchBooks();
    } catch (error) {
      // Parse error message from backend
      let errorMessage = `Failed to ${editingId ? 'update' : 'create'} book`;
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for ProblemDetails format
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Check for errors array (validation errors)
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).flat();
          if (errorMessages.length > 0) {
            errorMessage = errorMessages[0];
          }
        }
      }
      
      // Don't log to console, just show user-friendly message
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isbn: '',
      publicationDate: '',
      language: 'English',
      pageCount: '',
      publisher: '',
      authorId: '',
      genreIds: [],
      coverImage: null,
    });
    setCoverPreview(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      setDeletingId(id);
      await deleteBookAdmin(id);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    // fetchBooks will be called by useEffect when page or searchTerm changes
  };

  // Debounce search - separate from page effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Books Management</h1>
          <p className="text-slate-400 mt-1">Create and manage books</p>
        </div>
        <button
          onClick={async () => {
            resetForm();
            await fetchAuthorsAndGenres(); // Load authors before opening modal
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books..."
              className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No books found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Add your first book
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Cover</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Author</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">ISBN</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Rating</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-16 rounded-lg bg-slate-700 overflow-hidden">
                        {book.coverImageUrl || book.coverImage ? (
                          <img
                            src={getImageUrl(book.coverImageUrl || book.coverImage)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium truncate max-w-xs">{book.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm">
                        {book.author?.name || book.authorName || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm font-mono">{book.isbn || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-amber-500 font-medium">
                        {book.averageRating?.toFixed(1) || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={deletingId === book.id}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === book.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    placeholder="Book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Author *</label>
                  <select
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">
                      {formData.authorId ? 'Select author' : 'Select author'}
                    </option>
                    {authors.length > 0 ? (
                      authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading authors...</option>
                    )}
                  </select>
                  {formData.authorId && authors.find(a => a.id === formData.authorId) && (
                    <p className="text-xs text-slate-400 mt-1">
                      Selected: {authors.find(a => a.id === formData.authorId).name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    placeholder="ISBN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Publication Date</label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    placeholder="Language"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Page Count</label>
                  <input
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    placeholder="Number of pages"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    placeholder="Publisher name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Genres</label>
                  <select
                    multiple
                    value={formData.genreIds}
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, genreIds: selectedIds });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 min-h-[120px] max-h-[200px] overflow-y-auto"
                    size="5"
                  >
                    {genres.length > 0 ? (
                      genres.map((genre) => (
                        <option key={genre.id} value={genre.id} className="py-2">
                          {genre.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading genres...</option>
                    )}
                  </select>
                  <p className="text-xs text-slate-400 mt-2">
                    {formData.genreIds.length > 0 
                      ? `${formData.genreIds.length} genre(s) selected: ${genres.filter(g => formData.genreIds.includes(g.id)).map(g => g.name).join(', ')}`
                      : 'Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Book description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors">
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-sm text-slate-400">Click to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {coverPreview && (
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-slate-700">
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Book' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
