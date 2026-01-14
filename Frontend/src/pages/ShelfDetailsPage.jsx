import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Library, 
  BookOpen, 
  Loader, 
  Edit3, 
  Trash2, 
  X, 
  Check,
  AlertTriangle,
  BookMarked,
  Plus
} from 'lucide-react';
import { getShelfById, updateShelf, deleteShelf, removeBookFromShelf } from '../api/shelves';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';

const ShelfDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchShelfDetails();
  }, [id]);

  const fetchShelfDetails = async () => {
    try {
      setLoading(true);
      const shelfData = await getShelfById(id);
      setShelf(shelfData);
      setEditedName(shelfData.name);
    } catch (error) {
      console.error('Error fetching shelf details:', error);
      toast.error('Failed to load shelf details');
      navigate('/my-shelves');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameShelf = async () => {
    if (!editedName.trim()) {
      toast.error('Shelf name cannot be empty');
      return;
    }

    try {
      setUpdating(true);
      await updateShelf({ id: shelf.id, name: editedName.trim() });
      toast.success('Shelf renamed successfully!');
      setShelf({ ...shelf, name: editedName.trim() });
      setShowRenameModal(false);
    } catch (error) {
      console.error('Error renaming shelf:', error);
      const errorMessage = error.response?.data?.message || 'Failed to rename shelf';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteShelf = async () => {
    try {
      setDeleting(true);
      await deleteShelf(shelf.id);
      toast.success('Shelf deleted successfully!');
      navigate('/my-shelves');
    } catch (error) {
      console.error('Error deleting shelf:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete shelf';
      toast.error(errorMessage);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveBook = async (bookId, bookTitle) => {
    try {
      await removeBookFromShelf(shelf.id, bookId);
      toast.success(`"${bookTitle}" removed from shelf`);
      
      setShelf({
        ...shelf,
        books: shelf.books.filter(book => book.id !== bookId),
        bookCount: (shelf.bookCount || shelf.books.length) - 1
      });
    } catch (error) {
      console.error('Error removing book:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove book';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-stone-500 mt-4 font-medium">Loading shelf...</p>
        </div>
      </div>
    );
  }

  if (!shelf) {
    return null;
  }

  const bookCount = shelf.books?.length || shelf.bookCount || 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/my-shelves')}
            className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Shelves</span>
          </button>

          {/* Shelf Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
              {shelf.isDefault ? (
                <BookMarked className="w-7 h-7 text-white" />
              ) : (
                <Library className="w-7 h-7 text-white" />
              )}
            </div>
            
            {/* Title & Count */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 truncate">
                  {shelf.name}
                </h1>
                {shelf.isDefault && (
                  <span className="shrink-0 text-xs font-medium bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                    Default
                  </span>
                )}
              </div>
              <p className="text-stone-500">
                {bookCount} {bookCount === 1 ? 'book' : 'books'}
              </p>
            </div>

            {/* Actions - Only for custom shelves */}
            {!shelf.isDefault && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowRenameModal(true)}
                  className="w-10 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                  title="Rename shelf"
                >
                  <Edit3 className="w-5 h-5 text-stone-600" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  title="Delete shelf"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty State */}
        {bookCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">This shelf is empty</h3>
            <p className="text-stone-500 mb-6 text-center max-w-sm">
              Start adding books to build your collection
            </p>
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Browse Books
            </button>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {shelf.books?.map((book) => (
              <div key={book.id} className="group relative">
                <BookCard book={book} />
                
                {/* Remove Button - Visible on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBook(book.id, book.title);
                  }}
                  className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200"
                  title="Remove from shelf"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !updating && (setShowRenameModal(false), setEditedName(shelf.name))}
        >
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>
          
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-stone-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">Rename Shelf</h2>
              </div>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setEditedName(shelf.name);
                }}
                disabled={updating}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5">
              <label className="block text-sm font-medium text-stone-600 mb-2">
                New Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !updating) {
                    handleRenameShelf();
                  }
                }}
                placeholder="Enter new name"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setEditedName(shelf.name);
                }}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameShelf}
                disabled={updating || !editedName.trim()}
                className="flex-1 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>
          
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Delete Shelf?</h2>
              <p className="text-stone-500 mb-6">
                Are you sure you want to delete <span className="text-stone-900 font-medium">"{shelf.name}"</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteShelf}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfDetailsPage;
