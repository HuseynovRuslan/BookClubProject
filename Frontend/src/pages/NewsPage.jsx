import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Calendar,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getAllNews } from '../api/admin';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews(page, pageSize);
      const items = data?.items || data?.data || data || [];
      setNews(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => setSelectedNews(null)}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to News</span>
            </button>
          </div>
        </header>

        {/* News Detail */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <article className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Cover Image */}
            {selectedNews.coverImageUrl && (
              <div className="w-full h-64 sm:h-80 bg-stone-200 overflow-hidden">
                <img
                  src={getImageUrl(selectedNews.coverImageUrl)}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedNews.createdAt)}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                {selectedNews.title}
              </h1>

              {selectedNews.content && (
                <div className="prose prose-stone max-w-none mb-6">
                  <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-line">
                    {selectedNews.content}
                  </p>
                </div>
              )}

              {selectedNews.details && (
                <div className="prose prose-stone max-w-none">
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-900 mb-3">Details</h3>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                      {selectedNews.details}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-amber-500" />
                <h1 className="text-xl font-bold text-stone-900">News & Announcements</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200">
            <Newspaper className="w-16 h-16 text-stone-300 mb-4" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">No News Yet</h2>
            <p className="text-stone-500">Check back later for updates and announcements.</p>
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {news.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all text-left"
                >
                  {/* Image */}
                  <div className="w-full h-48 bg-stone-200 overflow-hidden">
                    {item.coverImageUrl ? (
                      <img
                        src={getImageUrl(item.coverImageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm text-stone-600 line-clamp-3 mb-3">
                      {item.content || item.details || 'No description available.'}
                    </p>

                    <span className="text-amber-600 text-sm font-medium group-hover:underline">
                      Read more →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <span className="text-stone-600 font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default NewsPage;
