import { useEffect, useState } from 'react';
import {
  Trash2,
  Loader2,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import { getAllFeedbacks, deleteFeedback, getFeedbackById } from '../../api/admin';
import { toast } from 'react-toastify';

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedbacks(page, pageSize);
      setFeedbacks(data?.items || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const data = await getFeedbackById(id);
      setViewingFeedback(data?.data || data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      setDeletingId(id);
      await deleteFeedback(id);
      toast.success('Feedback deleted successfully');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  };

  const getUserDisplay = (feedback) => {
    // FeedBackDto has Username field (from backend mapping)
    if (feedback.username) return feedback.username;
    return 'Anonymous';
  };

  const getUserEmail = (feedback) => {
    // FeedBackDto doesn't include email
    return null;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Feedbacks</h1>
        <p className="text-slate-400 mt-1">View and manage user feedbacks</p>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageSquareText className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No feedbacks found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Subject</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Message</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{getUserDisplay(feedback)}</p>
                          {getUserEmail(feedback) && (
                            <p className="text-slate-400 text-xs">{getUserEmail(feedback)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium truncate max-w-xs">
                        {feedback.subject || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm truncate max-w-md">
                        {truncateText(feedback.message || feedback.content)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {feedback.createdAt
                          ? new Date(feedback.createdAt).toLocaleDateString()
                          : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(feedback.id)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          disabled={deletingId === feedback.id}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === feedback.id ? (
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
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewingFeedback(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-semibold text-white">Feedback Details</h2>
              <button
                onClick={() => setViewingFeedback(null)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">{getUserDisplay(viewingFeedback)}</p>
                  {getUserEmail(viewingFeedback) && (
                    <p className="text-slate-400 text-sm">{getUserEmail(viewingFeedback)}</p>
                  )}
                  {viewingFeedback.createdAt && (
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(viewingFeedback.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                <p className="text-white font-medium">{viewingFeedback.subject || '—'}</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {viewingFeedback.message || viewingFeedback.content || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-slate-700 bg-slate-800">
              <button
                onClick={() => setViewingFeedback(null)}
                className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbacks;
