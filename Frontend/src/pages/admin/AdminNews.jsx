import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Newspaper,
  Image as ImageIcon,
  Pencil,
} from 'lucide-react';
import { getAllNews, createNews, updateNews, deleteNews } from '../../api/admin';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    details: '',
    coverImageUrl: '',
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      const items = data?.items || data?.data || data || [];
      setNews(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      details: item.details || '',
      coverImageUrl: item.coverImageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and Content are required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      
      if (editingId) {
        // Update mode
        submitData.append('Id', editingId);
        if (formData.title) submitData.append('Title', formData.title);
        if (formData.content) submitData.append('Content', formData.content);
        if (formData.details) submitData.append('Details', formData.details);
        if (formData.coverImageUrl) submitData.append('CoverImageUrl', formData.coverImageUrl);

        await updateNews(submitData);
        toast.success('News updated successfully');
      } else {
        // Create mode
        submitData.append('Title', formData.title);
        submitData.append('Content', formData.content);
        submitData.append('Details', formData.details);
        submitData.append('CoverImageUrl', formData.coverImageUrl);

        await createNews(submitData);
        toast.success('News created successfully');
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', content: '', details: '', coverImageUrl: '' });
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} news`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;

    try {
      setDeletingId(id);
      await deleteNews(id);
      toast.success('News deleted successfully');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', content: '', details: '', coverImageUrl: '' });
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">News Management</h1>
          <p className="text-slate-400 mt-1">Create and manage announcements</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', content: '', details: '', coverImageUrl: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add News
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Newspaper className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No news items found</p>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', content: '', details: '', coverImageUrl: '' });
                setShowModal(true);
              }}
              className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Create your first news item
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Image</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Title</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Content</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Created</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-700 overflow-hidden">
                      {item.coverImageUrl ? (
                        <img
                          src={getImageUrl(item.coverImageUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium truncate max-w-xs">{item.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-400 text-sm truncate max-w-md">
                      {truncateText(item.content)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-400 text-sm">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === item.id ? (
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
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/60" onClick={handleCloseModal} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit News' : 'Create News'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder="Enter content"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder="Additional details (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {editingId ? 'Update News' : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
