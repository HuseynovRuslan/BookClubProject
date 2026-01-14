import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, BookOpen, Calendar, Globe, FileText, 
  ChevronDown, Plus, Check, Loader, BookMarked,
  Folder, CheckCircle, X
} from 'lucide-react';
import { getBookById, updateBookStatus } from '../api/books';
import { getUserShelves, addBookToShelf } from '../api/shelves';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageHelper';
import ReviewSection from '../components/ReviewSection';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shelves, setShelves] = useState([]);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [addingToShelf, setAddingToShelf] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await getBookById(id);
      setBook(bookData);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShelves = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add books to your shelves');
      navigate('/login');
      return;
    }

    try {
      const shelvesData = await getUserShelves();
      
      let shelvesList = [];
      if (Array.isArray(shelvesData)) {
        shelvesList = shelvesData;
      } else if (shelvesData.items && Array.isArray(shelvesData.items)) {
        shelvesList = shelvesData.items;
      } else if (shelvesData.data && Array.isArray(shelvesData.data)) {
        shelvesList = shelvesData.data;
      } else {
        shelvesList = [];
      }
      
      setShelves(shelvesList);
      setShowShelfDropdown(true);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      toast.error('Failed to load shelves. Please try again.');
    }
  };

  const handleUpdateBookStatus = async (statusName) => {
    if (!isAuthenticated) {
      toast.info('Please log in to update book status');
      navigate('/login');
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateBookStatus(id, statusName);
      toast.success(`Book marked as "${statusName}"`);
      setShowShelfDropdown(false);
    } catch (error) {
      console.error('Error updating book status:', error);
      const errorMessage = 
        error.response?.data?.errors?.[0]?.description ||
        error.response?.data?.message ||
        'Failed to update book status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShelfClick = async (shelf) => {
    const defaultShelfNames = ['Want to Read', 'Currently Reading', 'Read'];
    const isDefault = shelf.isDefault === true || defaultShelfNames.includes(shelf.name);
    
    if (isDefault) {
      await handleUpdateBookStatus(shelf.name);
      setShowShelfDropdown(false);
      return;
    }
    
    await handleAddToShelf(shelf.id, shelf.name);
  };

  const handleAddToShelf = async (shelfId, shelfName) => {
    try {
      setAddingToShelf(true);
      await addBookToShelf(shelfId, id);
      toast.success(`Added to "${shelfName}"`);
      setShowShelfDropdown(false);
    } catch (error) {
      console.error('Error adding book to shelf:', error);
      
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      let errorMessage = 'Failed to add book to shelf';
      
      if (status === 409) {
        const errorCode = errorData?.errors?.[0]?.code || errorData?.errors?.[0]?.type;
        
        if (errorCode === 'Shelf.AlreadyAdded' || errorData?.errors?.[0]?.description?.includes('already')) {
          errorMessage = `This book is already in "${shelfName}"`;
        } else if (errorCode === 'Shelf.DefaultShelfAddDenied' || errorData?.errors?.[0]?.description?.includes('default')) {
          errorMessage = 'Cannot add books to default shelves. Use status buttons instead.';
        } else {
          errorMessage = errorData?.errors?.[0]?.description || errorData?.message || 'Book already in this shelf';
        }
      } else if (status === 403) {
        errorMessage = 'You are not authorized to modify this shelf';
      } else if (status === 404) {
        errorMessage = 'Shelf or book not found';
      } else {
        errorMessage = errorData?.errors?.[0]?.description || errorData?.message || 'Failed to add book to shelf';
      }
      
      toast.error(errorMessage);
    } finally {
      setAddingToShelf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-stone-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-stone-500">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  const getOpenLibraryCover = (isbn) => {
    if (!isbn) return null;
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
  };

  const openLibraryCover = getOpenLibraryCover(book.isbn || book.ISBN);
  const backendCover = getImageUrl(book.coverImageUrl);
  const coverImage = openLibraryCover || backendCover;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8">
            {/* Left Column - Book Cover */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                {/* Book Cover */}
                <div className="bg-stone-100 rounded-xl overflow-hidden mb-5">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={book.title}
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-80 flex items-center justify-center bg-stone-100">
                            <svg class="w-20 h-20 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-stone-100">
                      <BookOpen className="w-20 h-20 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Add to Shelf Button */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      onClick={fetchUserShelves}
                      disabled={addingToShelf || updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {(addingToShelf || updatingStatus) ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Add to Shelf</span>
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </>
                      )}
                    </button>

                    {/* Shelves Dropdown */}
                    {showShelfDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShelfDropdown(false)}
                        />
                        
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden">
                          <div className="px-2.5 py-1.5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                            <p className="text-xs font-medium text-stone-600">Choose a shelf</p>
                            <button 
                              onClick={() => setShowShelfDropdown(false)}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto">
                            {(() => {
                              if (shelves.length === 0) {
                                return (
                                  <div className="px-3 py-4 text-center text-stone-500">
                                    <p className="text-xs mb-1">No shelves found</p>
                                    <p className="text-xs">Create a shelf to add books</p>
                                  </div>
                                );
                              }
                              
                              const defaultShelfNames = ['Want to Read', 'Currently Reading', 'Read'];
                              
                              const sortedShelves = [...shelves].sort((a, b) => {
                                const aIsDefault = a.isDefault === true || defaultShelfNames.includes(a.name);
                                const bIsDefault = b.isDefault === true || defaultShelfNames.includes(b.name);
                                
                                if (aIsDefault && !bIsDefault) return -1;
                                if (!aIsDefault && bIsDefault) return 1;
                                
                                if (aIsDefault && bIsDefault) {
                                  const aIndex = defaultShelfNames.indexOf(a.name);
                                  const bIndex = defaultShelfNames.indexOf(b.name);
                                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                  if (aIndex !== -1) return -1;
                                  if (bIndex !== -1) return 1;
                                }
                                
                                return a.name.localeCompare(b.name);
                              });
                              
                              return sortedShelves.map((shelf) => {
                                const isDefault = shelf.isDefault === true || defaultShelfNames.includes(shelf.name);
                                const Icon = isDefault ? CheckCircle : Folder;
                                
                                return (
                                  <button
                                    key={shelf.id}
                                    onClick={() => handleShelfClick(shelf)}
                                    disabled={addingToShelf || updatingStatus}
                                    className="w-full text-left px-2.5 py-2 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <Icon className={`w-4 h-4 shrink-0 ${isDefault ? 'text-amber-600' : 'text-stone-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-medium text-stone-900">{shelf.name}</p>
                                        {isDefault && (
                                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                                            Status
                                          </span>
                                        )}
                                      </div>
                                      {shelf.bookCount !== undefined && (
                                        <p className="text-xs text-stone-500">{shelf.bookCount} books</p>
                                      )}
                                    </div>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Book Details */}
            <div className="lg:col-span-2">
              {/* Title and Author */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-lg text-stone-600">
                  by <span className="font-medium text-stone-900">{book.author?.name || 'Unknown Author'}</span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-bold text-stone-900">
                    {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <span className="text-stone-500">
                  {book.ratingCount} {book.ratingCount === 1 ? 'rating' : 'ratings'}
                </span>
              </div>

              {/* Book Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-stone-200">
                {book.publicationDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500">Published</p>
                      <p className="font-medium text-stone-900">
                        {new Date(book.publicationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {book.language && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500">Language</p>
                      <p className="font-medium text-stone-900">{book.language}</p>
                    </div>
                  </div>
                )}

                {book.pageCount > 0 && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500">Pages</p>
                      <p className="font-medium text-stone-900">{book.pageCount}</p>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500">Publisher</p>
                      <p className="font-medium text-stone-900">{book.publisher}</p>
                    </div>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <FileText className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500">ISBN</p>
                      <p className="font-mono text-sm text-stone-900">{book.isbn}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Genres */}
              {book.genres && book.genres.length > 0 && (
                <div className="mb-6 pb-6 border-b border-stone-200">
                  <h3 className="text-sm font-medium text-stone-500 mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium"
                      >
                        {genre.name || genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="text-sm font-medium text-stone-500 mb-3">Description</h3>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Author Bio */}
              {book.author?.bio && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="text-sm font-medium text-stone-500 mb-3">About the Author</h3>
                  <p className="text-stone-700 leading-relaxed">
                    {book.author.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewSection bookId={id} />
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
