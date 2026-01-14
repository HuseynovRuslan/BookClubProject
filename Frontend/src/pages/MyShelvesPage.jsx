import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, 
  BookOpen, 
  Loader, 
  Plus, 
  ChevronRight, 
  X,
  BookMarked,
  ArrowLeft
} from 'lucide-react';
import { getUserShelves, createShelf } from '../api/shelves';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageHelper';

const MyShelvesPage = () => {
  const navigate = useNavigate();
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      setLoading(true);
      const response = await getUserShelves();
      
      if (Array.isArray(response)) {
        setShelves(response);
      } else if (response.items) {
        setShelves(response.items);
      } else {
        setShelves([]);
      }
    } catch (error) {
      console.error('Error fetching shelves:', error);
      toast.error('Failed to load shelves');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShelf = async () => {
    if (!newShelfName.trim()) {
      toast.error('Please enter a shelf name');
      return;
    }

    try {
      setCreating(true);
      await createShelf({ name: newShelfName.trim() });
      toast.success('Shelf created successfully!');
      setShowCreateModal(false);
      setNewShelfName('');
      fetchShelves();
    } catch (error) {
      console.error('Error creating shelf:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create shelf';
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const getOpenLibraryCover = (isbn) => {
    if (!isbn) return null;
    const cleanISBN = String(isbn).replace(/[-\s]/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-stone-500 mt-4 font-medium">Loading your shelves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
                  My Shelves
                </h1>
                <p className="text-stone-500 text-sm mt-0.5">
                  {shelves.length} {shelves.length === 1 ? 'collection' : 'collections'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Shelf</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty State */}
        {shelves.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Library className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No shelves yet</h3>
            <p className="text-stone-500 mb-6 text-center max-w-sm">
              Create your first shelf to start organizing your books
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Shelf
            </button>
          </div>
        )}

        {/* Shelves Grid */}
        {shelves.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shelves.map((shelf) => {
              const bookCount = shelf.bookCount || shelf.books?.length || 0;
              
              return (
                <div
                  key={shelf.id}
                  onClick={() => navigate(`/shelves/${shelf.id}`)}
                  className="group bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-lg cursor-pointer transition-all duration-200"
                >
                  {/* Shelf Header */}
                  <div className="p-5 border-b border-stone-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                          {shelf.isDefault ? (
                            <BookMarked className="w-5 h-5 text-stone-600" />
                          ) : (
                            <Library className="w-5 h-5 text-stone-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-stone-900 truncate">
                            {shelf.name}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {bookCount} {bookCount === 1 ? 'book' : 'books'}
                          </p>
                        </div>
                      </div>
                      
                      {shelf.isDefault && (
                        <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-md shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book Previews */}
                  <div className="p-5">
                    {shelf.books && shelf.books.length > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {shelf.books.slice(0, 4).map((book, bookIndex) => {
                            const openLibraryCover = getOpenLibraryCover(book.isbn || book.ISBN);
                            const backendCover = getImageUrl(book.coverImageUrl);
                            const coverImage = openLibraryCover || backendCover;
                            
                            return (
                              <div
                                key={book.id}
                                className="w-10 h-14 rounded-md overflow-hidden border-2 border-white shadow-sm"
                                style={{ zIndex: 4 - bookIndex }}
                              >
                                {coverImage ? (
                                  <img
                                    src={coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '';
                                      e.target.parentElement.innerHTML = `
                                        <div class="w-full h-full bg-stone-100 flex items-center justify-center">
                                          <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                          </svg>
                                        </div>
                                      `;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-stone-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {shelf.books.length > 4 && (
                            <div className="w-10 h-14 rounded-md bg-stone-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-stone-500">
                                +{shelf.books.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-400">No books yet</span>
                        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Create New Shelf Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              className="group bg-white rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-400 cursor-pointer transition-all min-h-[160px] flex items-center justify-center"
            >
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-stone-400 group-hover:text-stone-600 transition-colors" />
                </div>
                <p className="text-stone-500 group-hover:text-stone-700 font-medium transition-colors">
                  Create New Shelf
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Browse Books CTA */}
        {shelves.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 font-medium rounded-xl border border-stone-200 hover:border-stone-300 transition-all"
            >
              <BookOpen className="w-5 h-5 text-stone-500" />
              Browse More Books
            </button>
          </div>
        )}
      </div>

      {/* Create Shelf Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !creating && (setShowCreateModal(false), setNewShelfName(''))}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>
          
          {/* Modal */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">New Shelf</h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewShelfName('');
                }}
                disabled={creating}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5">
              <label className="block text-sm font-medium text-stone-600 mb-2">
                Shelf Name
              </label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    handleCreateShelf();
                  }
                }}
                placeholder="e.g., Summer Reading"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewShelfName('');
                }}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShelf}
                disabled={creating || !newShelfName.trim()}
                className="flex-1 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Shelf'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShelvesPage;
