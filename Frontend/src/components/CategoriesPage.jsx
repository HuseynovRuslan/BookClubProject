import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGenres } from "../api/genres";
import { getBooksByGenre } from "../api/books";
import { getImageUrl } from "../api/config";
import BookCard from "./BookCard";

export default function CategoriesPage({ onBookClick }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await getGenres({ page: 1, pageSize: 100 });
      const items = response?.items || response?.Items || response || [];
      setCategories(items);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoadingBooks(true);
    setError(null);

    try {
      const categoryId = category.id || category.Id;
      const categoryName = category.name || category.Name;
      
      // Try by genre name first (as per backend API)
      const response = await getBooksByGenre(categoryName, { page: 1, pageSize: 100 });
      const items = response?.items || response?.Items || response || [];
      setCategoryBooks(items);
    } catch (err) {
      console.error("Error loading category books:", err);
      setError(err.message || "Failed to load books for this category");
      setCategoryBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBookClick = (book) => {
    if (onBookClick) {
      onBookClick(book);
    } else {
      navigate(`/books/${book.id || book.Id}`);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryBooks([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedCategory ? (
          <>
            {/* Categories List View */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Categories
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse books by category
              </p>
            </div>

            {loadingCategories ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {categories.map((category) => {
                  const categoryName = category.name || category.Name || "Unknown";
                  const categoryId = category.id || category.Id;
                  return (
                    <button
                      key={categoryId}
                      onClick={() => handleCategoryClick(category)}
                      className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📚</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm break-words">
                          {categoryName}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No categories found
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Categories will appear here once they are added
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Category Books View */}
            <div className="mb-8">
              <button
                onClick={handleBackToCategories}
                className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Categories
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedCategory.name || selectedCategory.Name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Books in this category
              </p>
            </div>

            {loadingBooks ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : categoryBooks.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Found <span className="font-semibold text-gray-900 dark:text-white">{categoryBooks.length}</span>{" "}
                    {categoryBooks.length === 1 ? "book" : "books"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {categoryBooks.map((book) => (
                    <div
                      key={book.id || book.Id}
                      onClick={() => handleBookClick(book)}
                      className="cursor-pointer transform transition-transform hover:scale-105"
                    >
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No books found
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  This category doesn't have any books yet
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

