import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Loader, ArrowLeft, Search } from 'lucide-react';
import BookCard from '../components/BookCard';
import { getAllBooks } from '../api/books';
import { toast } from 'react-toastify';

const BrowseBooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  const fetchBooks = async (page) => {
    try {
      setLoading(true);
      const response = await getAllBooks(page, pageSize);
      
      setBooks(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Browse Books</h1>
              <p className="text-stone-500 text-sm mt-0.5">
                Discover your next great read
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Bar */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-stone-600 text-sm">
              Showing{' '}
              <span className="font-medium text-stone-900">
                {(currentPage - 1) * pageSize + 1}
              </span>
              {' – '}
              <span className="font-medium text-stone-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>
              {' of '}
              <span className="font-medium text-stone-900">{totalCount}</span> books
            </p>
            <p className="text-sm text-stone-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-stone-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-stone-500">Loading books...</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No books found</h3>
            <p className="text-stone-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && books.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-colors
                ${
                  currentPage === 1
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      w-10 h-10 rounded-lg font-medium text-sm transition-colors
                      ${
                        currentPage === pageNum
                          ? 'bg-stone-900 text-white'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-colors
                ${
                  currentPage === totalPages
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }
              `}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseBooksPage;
