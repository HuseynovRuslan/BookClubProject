import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, BookOpen, Users, FileText, Trash2, Search, Edit, MessageSquare, Star, Plus, X, MoreVertical, UserPen, Tag, LogOut } from "lucide-react";
import { getAllBooksForAdmin, deleteBookAsAdmin, deleteQuoteAsAdmin, deleteReviewAsAdmin, createBookAsAdmin, updateBookAsAdmin, getAllUsersForAdmin, updateQuoteAsAdmin, updateReviewAsAdmin, createAuthorAsAdmin, updateAuthorAsAdmin, deleteAuthorAsAdmin, createGenreAsAdmin, updateGenreAsAdmin, deleteGenreAsAdmin } from "../api/admin";
import { getQuotes } from "../api/quotes";
import { getReviews } from "../api/reviews";
import { getAuthors } from "../api/authors";
import { getGenres } from "../api/genres";
import { addGenresToBook } from "../api/books";
import { getImageUrl } from "../api/config";

export default function AdminPanelPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("books");

  // Check if user is admin
  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-gray-100 dark:border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-amber-600 rounded-2xl shadow-xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Access Denied
          </h2>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "books", label: "Books", icon: BookOpen },
    { id: "authors", label: "Authors", icon: UserPen },
    { id: "genres", label: "Genres", icon: Tag },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border-2 border-gray-100 dark:border-gray-200">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-3xl"></div>
            <div className="relative flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 shadow-lg">
                  <Shield className="w-8 h-8 text-amber-600 dark:text-amber-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-gray-700 dark:text-gray-700 font-semibold mt-1">
                    Manage books, users, and platform content
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-600 hover:from-red-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-white rounded-3xl shadow-2xl mb-6 border-2 border-gray-100 dark:border-gray-200 overflow-hidden">
          <div className="flex flex-wrap gap-2 p-3 sm:p-4 border-b-2 border-gray-100 dark:border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 dark:text-gray-700 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 dark:hover:from-amber-50 dark:hover:via-orange-50 dark:hover:to-red-50 hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-gray-100 dark:border-gray-200">
          {activeTab === "books" && <BooksManagement />}
          {activeTab === "authors" && <AuthorsManagement />}
          {activeTab === "genres" && <GenresManagement />}
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "content" && <ContentModeration />}
        </div>
      </div>
    </div>
  );
}

// Books Management Component
function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const pageSize = 20;

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await getAllBooksForAdmin({
        pageNumber,
        pageSize,
        searchTerm: searchTerm.trim() || undefined,
      });
      
      console.log("Fetch books response:", response);
      
      // Handle PagedResult format (Items property with capital I, or items with lowercase)
      let booksList = [];
      let total = 0;
      
      if (response?.Items && Array.isArray(response.Items)) {
        booksList = response.Items;
        total = response.TotalCount || response.totalCount || 0;
      } else if (response?.items && Array.isArray(response.items)) {
        booksList = response.items;
        total = response.totalCount || response.TotalCount || response.total || 0;
      } else if (response?.data?.Items && Array.isArray(response.data.Items)) {
        booksList = response.data.Items;
        total = response.data.TotalCount || response.data.totalCount || 0;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        booksList = response.data.items;
        total = response.data.totalCount || response.data.TotalCount || 0;
      } else if (Array.isArray(response)) {
        booksList = response;
        total = response.length;
      }
      
      console.log("Parsed books list:", booksList);
      console.log("Total count:", total);
      
      setBooks(booksList);
      setTotalCount(total);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBooks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [pageNumber]);

  useEffect(() => {
    // Fetch authors and genres for dropdowns
    const fetchData = async () => {
      try {
        console.log("Fetching authors and genres...");
        
        // Fetch all authors (may need multiple pages)
        let allAuthors = [];
        let authorsPage = 1;
        let hasMoreAuthors = true;
        const maxAuthorsPages = 10; // Limit to prevent infinite loops
        
        while (hasMoreAuthors && authorsPage <= maxAuthorsPages) {
          const authorsRes = await getAuthors({ page: authorsPage, pageSize: 50 });
          
          // Parse response
          let authorsList = [];
          if (authorsRes?.items && Array.isArray(authorsRes.items)) {
            authorsList = authorsRes.items;
          } else if (authorsRes?.Items && Array.isArray(authorsRes.Items)) {
            authorsList = authorsRes.Items;
          } else if (Array.isArray(authorsRes)) {
            authorsList = authorsRes;
          }
          
          if (authorsList.length > 0) {
            allAuthors.push(...authorsList);
            // If we got less than 50, we've reached the end
            if (authorsList.length < 50) {
              hasMoreAuthors = false;
            } else {
              authorsPage++;
            }
          } else {
            hasMoreAuthors = false;
          }
        }
        
        // Fetch all genres (may need multiple pages)
        let allGenres = [];
        let genresPage = 1;
        let hasMoreGenres = true;
        const maxGenresPages = 10; // Limit to prevent infinite loops
        
        while (hasMoreGenres && genresPage <= maxGenresPages) {
          const genresRes = await getGenres({ page: genresPage, pageSize: 50 });
          
          // Parse response
          let genresList = [];
          if (genresRes?.items && Array.isArray(genresRes.items)) {
            genresList = genresRes.items;
          } else if (genresRes?.Items && Array.isArray(genresRes.Items)) {
            genresList = genresRes.Items;
          } else if (Array.isArray(genresRes)) {
            genresList = genresRes;
          }
          
          if (genresList.length > 0) {
            allGenres.push(...genresList);
            // If we got less than 50, we've reached the end
            if (genresList.length < 50) {
              hasMoreGenres = false;
            } else {
              genresPage++;
            }
          } else {
            hasMoreGenres = false;
          }
        }
        
        console.log("Total authors fetched:", allAuthors.length);
        console.log("Total genres fetched:", allGenres.length);
        
        // Use the first page response for detailed logging (for debugging)
        const authorsRes = allAuthors.length > 0 ? { items: allAuthors } : null;
        const genresRes = allGenres.length > 0 ? { items: allGenres } : null;
        
        setAuthors(allAuthors);
        setGenres(allGenres);
      } catch (error) {
        console.error("Failed to fetch authors/genres:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          data: error.data,
          stack: error.stack
        });
        setAuthors([]);
        setGenres([]);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pageNumber === 1) {
        fetchBooks();
      } else {
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteBook = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setDeletingId(bookId);
    try {
      await deleteBookAsAdmin(bookId);
      await fetchBooks(); // Refresh list
    } catch (error) {
      console.error("Failed to delete book:", error);
      alert("Failed to delete book. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateBook = () => {
    setEditingBook(null);
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookModal(true);
  };

  const handleSaveBook = async (bookData) => {
    try {
      let bookId;
      if (editingBook) {
        await updateBookAsAdmin(editingBook.id, bookData);
        bookId = editingBook.id;
      } else {
        // Create book and get the book ID from response
        const response = await createBookAsAdmin(bookData);
        console.log("Create book response:", response);
        
        // Backend returns CreatedAtAction (201) with ApiResponse
        // The ID is in the Location header, but we can also try to extract from response
        // Try multiple ways to get the book ID
        if (response?.data) {
          bookId = response.data;
        } else if (response?.id) {
          bookId = response.id;
        } else if (typeof response === 'string') {
          bookId = response;
        } else {
          console.warn("Could not extract book ID from create response, will refresh list:", response);
          // We'll refresh the list anyway, so the book should appear
        }
      }
      
      // Add genres to book if any are selected
      if (bookData.genreIds && bookData.genreIds.length > 0 && bookId) {
        try {
          await addGenresToBook(bookId, bookData.genreIds);
        } catch (genreError) {
          console.error("Failed to add genres to book:", genreError);
          // Don't fail the whole operation if genre addition fails
        }
      }
      
      setShowBookModal(false);
      setEditingBook(null);
      
      // Always refresh the book list after creating/updating
      await fetchBooks();
    } catch (error) {
      console.error("Failed to save book:", error);
      alert("Failed to save book. Please try again.");
      throw error;
    }
  };

  const filteredBooks = books.filter((book) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.authorName?.toLowerCase().includes(term) ||
      book.author?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
          Books Management
        </h2>
        <div className="flex gap-3 flex-1 max-w-md">
          <button
            onClick={handleCreateBook}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
            title="Add Book"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 dark:text-amber-600" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          />
          </div>
        </div>
      </div>

      {showBookModal && (
        <BookFormModal
          book={editingBook}
          authors={authors}
          genres={genres}
          onClose={() => {
            setShowBookModal(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold">Loading...</p>
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-10 h-10 text-amber-600 dark:text-amber-600 opacity-70" />
          </div>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">No books found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-visible">
            {filteredBooks.map((book) => {
              const coverUrl = book.coverImageUrl || book.cover || book.CoverImageUrl;
              const imageUrl = coverUrl ? getImageUrl(coverUrl) : null;
              
              return (
                <div
                  key={book.id}
                  className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-visible"
                >
                  <div className="flex gap-4 pr-8">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded-md shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-black dark:text-black text-sm mb-1 line-clamp-2 pr-2">
                        {book.title || book.Title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-600 mb-2">
                        {book.authorName || book.author?.name || book.AuthorName || "Unknown Author"}
                      </p>
                    </div>
                  </div>

                  {/* Menu Button - 3 dots */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === book.id ? null : book.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openMenuId === book.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBook(book);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 transition-all font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-600" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                              setOpenMenuId(null);
                            }}
                            disabled={deletingId === book.id}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 dark:hover:from-red-50 dark:hover:to-red-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-600" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-gray-700 dark:text-gray-700 font-bold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 rounded-xl border-2 border-amber-200 dark:border-amber-200">
                Page {pageNumber} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Users Management Component
function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const pageSize = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersForAdmin({
        pageNumber,
        pageSize,
        query: searchTerm.trim() || undefined,
      });
      
      if (response?.items) {
        setUsers(response.items);
        setTotalCount(response.totalCount || 0);
      } else if (response?.data?.items) {
        setUsers(response.data.items);
        setTotalCount(response.data.totalCount || 0);
      } else if (response?.Items) {
        setUsers(response.Items);
        setTotalCount(response.TotalCount || 0);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageNumber]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pageNumber === 1) {
        fetchUsers();
      } else {
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
          Users Management
        </h2>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 dark:text-amber-600" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold">Loading...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-2xl shadow-lg mb-4">
            <Users className="w-10 h-10 text-amber-600 dark:text-amber-600 opacity-70" />
          </div>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">No users found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {filteredUsers.map((user) => {
              const isMenuOpen = openMenuId === user.id;
              const avatarUrl = user.profilePictureUrl || user.ProfilePictureUrl || user.avatarUrl || user.AvatarUrl;
              const imageUrl = avatarUrl ? getImageUrl(avatarUrl) : null;
              const userName = user.username || user.userName || user.Username || user.name || user.Name || "Unknown User";
              const userEmail = user.email || user.Email || "";
              const userRole = user.role || user.Role || "User";
              
              return (
                <div
                  key={user.id || user.Id}
                  className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 relative"
                >
                  <div className="flex items-center gap-4 pr-8">
                    {/* Avatar */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200 shrink-0"
                        onError={(e) => {
                          // Hide the image and show placeholder instead
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 flex items-center justify-center border-2 border-gray-200 dark:border-gray-200 shrink-0 ${imageUrl ? 'hidden' : ''}`}
                    >
                      <Users className="w-6 h-6 text-amber-600 dark:text-amber-600" />
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-black dark:text-black text-sm">
                          {userName}
                        </h3>
                        {userRole === "Admin" && (
                          <span className="px-2 py-0.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold rounded-lg">
                            Admin
                          </span>
                        )}
                        {userRole === "writer" && (
                          <span className="px-2 py-0.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-lg">
                            Writer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-600 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  {/* Menu Button - 3 dots */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : user.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const username = user.username || user.userName || user.Username || user.name || user.Name;
                              if (username) {
                                navigate(`/profile/${username}`);
                              }
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 transition-all font-semibold"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-600" />
                            View Profile
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-gray-700 dark:text-gray-700 font-bold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 rounded-xl border-2 border-amber-200 dark:border-amber-200">
                Page {pageNumber} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Content Moderation Component
function ContentModeration() {
  const [activeContentType, setActiveContentType] = useState("quotes"); // "quotes" or "reviews"
  const [quotes, setQuotes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const pageSize = 20;

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await getQuotes({ page: pageNumber, pageSize });
      
      if (response?.data?.items) {
        setQuotes(response.data.items);
        setTotalCount(response.data.totalCount || 0);
      } else if (response?.items) {
        setQuotes(response.items);
        setTotalCount(response.totalCount || response.total || 0);
      } else {
        setQuotes([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviews({ page: pageNumber, pageSize });
      
      if (response?.data?.items) {
        setReviews(response.data.items);
        setTotalCount(response.data.totalCount || 0);
      } else if (response?.items) {
        setReviews(response.items);
        setTotalCount(response.totalCount || response.total || 0);
      } else {
        setReviews([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeContentType === "quotes") {
      fetchQuotes();
    } else {
      fetchReviews();
    }
  }, [activeContentType, pageNumber]);

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm("Are you sure you want to delete this quote?")) {
      return;
    }

    setDeletingId(quoteId);
    try {
      await deleteQuoteAsAdmin(quoteId);
      await fetchQuotes(); // Refresh list
    } catch (error) {
      console.error("Failed to delete quote:", error);
      alert("Failed to delete quote. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      await deleteReviewAsAdmin(reviewId);
      await fetchReviews(); // Refresh list
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };


  const currentItems = activeContentType === "quotes" ? quotes : reviews;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
          Content Moderation
        </h2>
      </div>

      {/* Content Type Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200 dark:border-gray-200 pb-2">
        <button
          onClick={() => {
            setActiveContentType("quotes");
            setPageNumber(1);
          }}
          className={`px-5 py-3 font-bold transition-all duration-300 border-b-2 rounded-t-xl ${
            activeContentType === "quotes"
              ? "border-amber-600 text-amber-600 dark:text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50"
              : "border-transparent text-gray-700 dark:text-gray-700 hover:text-amber-600 dark:hover:text-amber-600 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Quotes
        </button>
        <button
          onClick={() => {
            setActiveContentType("reviews");
            setPageNumber(1);
          }}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeContentType === "reviews"
              ? "border-amber-600 text-amber-600 dark:text-amber-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Reviews
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold">Loading...</p>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-2xl shadow-lg mb-4">
            <FileText className="w-10 h-10 text-amber-600 dark:text-amber-600 opacity-70" />
          </div>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">No content found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {activeContentType === "quotes" ? (
              quotes.map((quote) => {
                const book = quote.book || quote.Book;
                const user = quote.user || quote.User;
                const coverUrl = book?.coverImageUrl || book?.CoverImageUrl || book?.cover;
                const imageUrl = coverUrl ? getImageUrl(coverUrl) : null;
                
                // Extract book info
                const bookTitle = book?.title || book?.Title || "Unknown Book";
                const authorName = book?.authorName || book?.AuthorName || book?.author?.name || book?.author?.Name || "Unknown Author";
                
                // Extract user info
                const userName = user?.username || user?.userName || user?.Username || user?.name || user?.Name || 
                                 (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                                 (user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : null) ||
                                 "Unknown User";
                
                const quoteId = quote.id || quote.Id;
                const isMenuOpen = openMenuId === quoteId;
                
                return (
                  <div
                    key={quoteId}
                    className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-visible"
                  >
                    <div className="flex gap-4 pr-8">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={bookTitle}
                          className="w-16 h-24 object-cover rounded-md shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-700 italic mb-1 line-clamp-2">
                              "{quote.text || quote.Text || quote.quoteText || quote.QuoteText}"
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-600 mb-1">
                              <span className="font-semibold text-black dark:text-black">{bookTitle}</span>
                              {" by "}
                              <span className="text-black dark:text-black">{authorName}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              By <span className="font-semibold text-black dark:text-black">{userName}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Button - 3 dots */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : quoteId);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuote(quoteId);
                                setOpenMenuId(null);
                              }}
                              disabled={deletingId === quoteId}
                              className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 dark:hover:from-red-50 dark:hover:to-red-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-600" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              reviews.map((review) => {
                // BookReviewDto has BookTitle and BookCoverImageUrl directly
                const bookTitle = review.bookTitle || review.BookTitle || review.book?.title || review.Book?.Title || "Unknown Book";
                const coverUrl = review.bookCoverImageUrl || review.BookCoverImageUrl || review.book?.coverImageUrl || review.Book?.CoverImageUrl || review.book?.cover;
                const imageUrl = coverUrl ? getImageUrl(coverUrl) : null;
                
                // BookReviewDto has Username directly
                const userName = review.username || review.Username || review.user?.username || review.User?.Username || review.user?.userName || 
                                 review.user?.name || review.User?.Name || 
                                 (review.user?.firstName && review.user?.lastName ? `${review.user.firstName} ${review.user.lastName}` : null) ||
                                 (review.User?.FirstName && review.User?.LastName ? `${review.User.FirstName} ${review.User.LastName}` : null) ||
                                 "Unknown User";
                
                const reviewId = review.id || review.Id;
                const isMenuOpen = openMenuId === reviewId;
                
                return (
                  <div
                    key={reviewId}
                    className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-visible"
                  >
                    <div className="flex gap-4 pr-8">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={bookTitle}
                          className="w-16 h-24 object-cover rounded-md shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-black dark:text-black text-sm">
                                {bookTitle}
                              </span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < (review.rating || review.Rating || 0)
                                        ? "fill-amber-500 text-amber-500"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-700 mb-1 line-clamp-2">
                              {review.reviewText || review.ReviewText || review.text || review.Text || ""}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              By <span className="font-semibold text-black dark:text-black">{userName}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Button - 3 dots */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : reviewId);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReview(reviewId);
                                setOpenMenuId(null);
                              }}
                              disabled={deletingId === reviewId}
                              className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 dark:hover:from-red-50 dark:hover:to-red-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-600" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-gray-700 dark:text-gray-700 font-bold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 rounded-xl border-2 border-amber-200 dark:border-amber-200">
                Page {pageNumber} / {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= totalPages}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Authors Management Component
function AuthorsManagement() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 20;

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profileImage: null,
  });

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await getAuthors({ page: pageNumber, pageSize, query: searchTerm.trim() || undefined });
      
      if (response?.items) {
        setAuthors(response.items);
        setTotalCount(response.totalCount || response.total || 0);
      } else if (response?.data?.items) {
        setAuthors(response.data.items);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setAuthors([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, [pageNumber]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageNumber === 1) {
        fetchAuthors();
      } else {
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateAuthor = () => {
    setEditingAuthor(null);
    setFormData({
      name: "",
      bio: "",
      profileImage: null,
    });
    setShowAuthorForm(true);
  };

  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name || author.Name || "",
      bio: author.bio || author.Bio || "",
      profileImage: null,
    });
    setShowAuthorForm(true);
  };

  const handleDeleteAuthor = async (authorId) => {
    if (!confirm("Are you sure you want to delete this author?")) {
      return;
    }

    setDeletingId(authorId);
    try {
      await deleteAuthorAsAdmin(authorId);
      await fetchAuthors();
    } catch (error) {
      console.error("Failed to delete author:", error);
      alert("Failed to delete author. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveAuthor = async () => {
    if (!formData.name.trim()) {
      alert("Author name is required");
      return;
    }

    try {
      const authorData = new FormData();
      authorData.append("Name", formData.name);
      if (formData.bio) authorData.append("Bio", formData.bio);
      if (formData.profileImage) authorData.append("ProfilePicture", formData.profileImage);

      if (editingAuthor) {
        await updateAuthorAsAdmin(editingAuthor.id || editingAuthor.Id, authorData);
      } else {
        await createAuthorAsAdmin(authorData);
      }

      setShowAuthorForm(false);
      setEditingAuthor(null);
      setFormData({
        name: "",
        bio: "",
        profileImage: null,
      });
      await fetchAuthors();
    } catch (error) {
      console.error("Failed to save author:", error);
      alert("Failed to save author. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
          Authors Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 dark:text-amber-600" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            />
          </div>
          <button
            onClick={handleCreateAuthor}
            className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            title="Add Author"
          >
            <Plus className="w-5 h-5" />
            <span className="sr-only">Add Author</span>
          </button>
        </div>
      </div>

      {showAuthorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100 dark:border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
                  {editingAuthor ? "Edit Author" : "Add Author"}
                </h3>
                <button
                  onClick={() => {
                    setShowAuthorForm(false);
                    setEditingAuthor(null);
                    setFormData({
                      name: "",
                      bio: "",
                      profileImage: null,
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-2">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files[0] })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveAuthor}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAuthorForm(false);
                    setEditingAuthor(null);
                    setFormData({
                      name: "",
                      bio: "",
                      profileImage: null,
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold">Loading...</p>
          </div>
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-2xl shadow-lg mb-4">
            <UserPen className="w-10 h-10 text-amber-600 dark:text-amber-600 opacity-70" />
          </div>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">No authors found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-visible">
            {authors.map((author) => {
              const authorId = author.id || author.Id;
              const isMenuOpen = openMenuId === authorId;
              const imageUrl = author.profilePictureUrl || author.ProfilePictureUrl ? getImageUrl(author.profilePictureUrl || author.ProfilePictureUrl) : null;
              
              return (
                <div
                  key={authorId}
                  className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-visible"
                >
                  <div className="flex gap-4 pr-8">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={author.name || author.Name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200 shrink-0"
                        onError={(e) => {
                          // Hide the image and show placeholder instead
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 flex items-center justify-center border-2 border-gray-200 dark:border-gray-200 shrink-0 ${imageUrl ? 'hidden' : ''}`}
                    >
                      <UserPen className="w-8 h-8 text-amber-600 dark:text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-black dark:text-black text-sm mb-1 line-clamp-2">
                        {author.name || author.Name || "Unknown Author"}
                      </h3>
                      {author.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                          {author.bio || author.Bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : authorId);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                    </button>
                    
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAuthor(author);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 transition-all font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-600" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAuthor(authorId);
                              setOpenMenuId(null);
                            }}
                            disabled={deletingId === authorId}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 dark:hover:from-red-50 dark:hover:to-red-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-600" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-gray-700 dark:text-gray-700 font-bold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 rounded-xl border-2 border-amber-200 dark:border-amber-200">
                Page {pageNumber} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Genres Management Component
function GenresManagement() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 20;

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const response = await getGenres({ page: pageNumber, pageSize, query: searchTerm.trim() || undefined });
      
      if (response?.items) {
        setGenres(response.items);
        setTotalCount(response.totalCount || response.total || 0);
      } else if (response?.data?.items) {
        setGenres(response.data.items);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setGenres([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch genres:", error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [pageNumber]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageNumber === 1) {
        fetchGenres();
      } else {
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateGenre = () => {
    setEditingGenre(null);
    setFormData({
      name: "",
    });
    setShowGenreForm(true);
  };

  const handleEditGenre = (genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name || genre.Name || "",
    });
    setShowGenreForm(true);
  };

  const handleDeleteGenre = async (genreId) => {
    if (!confirm("Are you sure you want to delete this genre?")) {
      return;
    }

    setDeletingId(genreId);
    try {
      await deleteGenreAsAdmin(genreId);
      await fetchGenres();
    } catch (error) {
      console.error("Failed to delete genre:", error);
      alert("Failed to delete genre. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveGenre = async () => {
    if (!formData.name.trim()) {
      alert("Genre name is required");
      return;
    }

    try {
      const genreData = {
        Name: formData.name,
      };

      if (editingGenre) {
        await updateGenreAsAdmin(editingGenre.id || editingGenre.Id, genreData);
      } else {
        await createGenreAsAdmin(genreData);
      }

      setShowGenreForm(false);
      setEditingGenre(null);
      setFormData({
        name: "",
      });
      await fetchGenres();
    } catch (error) {
      console.error("Failed to save genre:", error);
      alert("Failed to save genre. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
          Genres Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600 dark:text-amber-600" />
            <input
              type="text"
              placeholder="Search genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            />
          </div>
          <button
            onClick={handleCreateGenre}
            className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            title="Add Genre"
          >
            <Plus className="w-5 h-5" />
            <span className="sr-only">Add Genre</span>
          </button>
        </div>
      </div>

      {showGenreForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-gray-100 dark:border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
                  {editingGenre ? "Edit Genre" : "Add Genre"}
                </h3>
                <button
                  onClick={() => {
                    setShowGenreForm(false);
                    setEditingGenre(null);
                    setFormData({
                      name: "",
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:border-amber-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveGenre}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowGenreForm(false);
                    setEditingGenre(null);
                    setFormData({
                      name: "",
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-5 h-5 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold">Loading...</p>
          </div>
        </div>
      ) : genres.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-2xl shadow-lg mb-4">
            <Tag className="w-10 h-10 text-amber-600 dark:text-amber-600 opacity-70" />
          </div>
          <p className="text-gray-700 dark:text-gray-700 font-semibold">No genres found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-visible">
            {genres.map((genre) => {
              const genreId = genre.id || genre.Id;
              const isMenuOpen = openMenuId === genreId;
              
              return (
                <div
                  key={genreId}
                  className="bg-white dark:bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-200 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-visible"
                >
                  <div className="pr-8">
                    <h3 className="font-bold text-black dark:text-black text-base mb-2">
                      {genre.name || genre.Name || "Unknown Genre"}
                    </h3>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : genreId);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                    </button>
                    
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-white rounded-lg shadow-xl border-2 border-gray-100 dark:border-gray-200 min-w-[100px] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGenre(genre);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 transition-all font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-600" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGenre(genreId);
                              setOpenMenuId(null);
                            }}
                            disabled={deletingId === genreId}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 dark:hover:from-red-50 dark:hover:to-red-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-600" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 text-gray-700 dark:text-gray-700 font-bold bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 rounded-xl border-2 border-amber-200 dark:border-amber-200">
                Page {pageNumber} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Book Form Modal Component
function BookFormModal({ book, authors, genres, onClose, onSave }) {
  const isEdit = !!book;
  const [formData, setFormData] = useState({
    title: book?.title || book?.Title || "",
    description: book?.description || book?.Description || "",
    isbn: book?.isbn || book?.ISBN || "",
    publicationDate: book?.publicationDate || book?.PublicationDate 
      ? String(book.publicationDate || book.PublicationDate).split("T")[0] 
      : "",
    language: book?.language || book?.Language || "",
    pageCount: book?.pageCount || book?.PageCount || "",
    publisher: book?.publisher || book?.Publisher || "",
    authorId: book?.authorId || book?.AuthorId || book?.author?.id || book?.author?.Id || book?.Author?.id || book?.Author?.Id || "",
    genreIds: book?.genres?.map(g => g.id || g.Id) || book?.Genres?.map(g => g.id || g.Id) || [],
    coverImage: null,
  });
  const [previewImage, setPreviewImage] = useState(
    book?.coverImageUrl || book?.CoverImageUrl ? getImageUrl(book.coverImageUrl || book.CoverImageUrl) : null
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGenreChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedGenreIds = selectedOptions.map(option => option.value);
    setFormData((prev) => ({ ...prev, genreIds: selectedGenreIds }));
    if (errors.genreIds) {
      setErrors((prev) => ({ ...prev, genreIds: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.authorId) newErrors.authorId = "Author is required";
    if (!formData.publicationDate?.trim()) {
      newErrors.publicationDate = "Publication date is required";
    }
    // ISBN validation: max 17 characters (backend requirement)
    if (formData.isbn && formData.isbn.trim().length > 17) {
      newErrors.isbn = "ISBN must be 17 characters or less";
    }
    if (!isEdit && !formData.coverImage && !previewImage) {
      newErrors.coverImage = "Cover image is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // Format publication date - Backend expects DateOnly format (YYYY-MM-DD)
      let publicationDate = formData.publicationDate?.trim();
      if (publicationDate) {
        // Extract date part only (YYYY-MM-DD)
        publicationDate = publicationDate.split("T")[0];
      }

      // Ensure publicationDate is provided (required by backend validation)
      if (!publicationDate) {
        setErrors({ publicationDate: "Publication date is required" || "Publication date is required" });
        setSaving(false);
        return;
      }

      await onSave({
        ...formData,
        publicationDate: publicationDate,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
      });
    } catch (error) {
      // Error handled in parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-4">
      <div
        className="bg-white dark:bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 my-4 animate-slideUp max-h-[90vh] flex flex-col border-2 border-gray-100 dark:border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b-2 border-gray-100 dark:border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-t-3xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100">
              <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">
              {isEdit ? "Edit Book" : "Add Book"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-2xl transition-all hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.title ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
                placeholder="Enter book title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Author <span className="text-red-500">*</span>
              </label>
              <select
                name="authorId"
                value={formData.authorId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.authorId ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
              >
                <option value="">Select Author</option>
                {authors && authors.length > 0 ? (
                  authors.map((author) => (
                    <option key={author.id || author.Id} value={author.id || author.Id}>
                      {author.name || author.Name || "Unknown Author"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No authors found</option>
                )}
              </select>
              {errors.authorId && <p className="text-red-500 text-xs mt-1">{errors.authorId}</p>}
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                ISBN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                maxLength={17}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.isbn ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
                placeholder="Enter ISBN"
              />
              {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn}</p>}
              {formData.isbn && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formData.isbn.length}/17 characters
                </p>
              )}
            </div>

            {/* Publication Date */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Publication Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.publicationDate ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
                required
              />
              {errors.publicationDate && <p className="text-red-500 text-xs mt-1">{errors.publicationDate}</p>}
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="e.g., English, Spanish"
              />
            </div>

            {/* Page Count */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Page Count
              </label>
              <input
                type="number"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="Enter page count"
                min="0"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="Enter publisher name"
              />
            </div>

            {/* Genres/Categories */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Genres
              </label>
              <select
                name="genreIds"
                multiple
                value={formData.genreIds}
                onChange={handleGenreChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all min-h-[120px] ${
                  errors.genreIds ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
              >
                {genres && genres.length > 0 ? (
                  genres.map((genre) => (
                    <option key={genre.id || genre.Id} value={genre.id || genre.Id}>
                      {genre.name || genre.Name || "Unknown Genre"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No genres found</option>
                )}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Select multiple genres
              </p>
              {errors.genreIds && <p className="text-red-500 text-xs mt-1">{errors.genreIds}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none ${
                  errors.description ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                }`}
                placeholder="Enter book description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                Cover Image {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-4">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-32 h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-3 border-2 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                      errors.coverImage ? "border-red-500" : "border-gray-200 dark:border-gray-200"
                    }`}
                  />
                  {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100 dark:border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 text-gray-700 dark:text-gray-700 font-bold rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

