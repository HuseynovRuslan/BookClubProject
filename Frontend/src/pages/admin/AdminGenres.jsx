import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
} from 'lucide-react';
import { getAllGenres, createGenre, updateGenre, deleteGenre } from '../../api/admin';
import { toast } from 'react-toastify';

const AdminGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 15;

  // Form state
  const [genreName, setGenreName] = useState('');

  useEffect(() => {
    fetchGenres();
  }, [page, searchTerm]);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await getAllGenres(page, pageSize, searchTerm);
      setGenres(data?.items || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Failed to load genres');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (genre) => {
    setEditingId(genre.id);
    setGenreName(genre.name);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!genreName.trim()) {
      toast.error('Genre name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await updateGenre(editingId, genreName.trim());
        toast.success('Genre updated successfully');
      } else {
        await createGenre(genreName.trim());
        toast.success('Genre created successfully');
      }
      setShowModal(false);
      setGenreName('');
      setEditingId(null);
      fetchGenres();
    } catch (error) {
      console.error('Error saving genre:', error);
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} genre`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this genre?')) return;

    try {
      setDeletingId(id);
      await deleteGenre(id);
      toast.success('Genre deleted successfully');
      fetchGenres();
    } catch (error) {
      console.error('Error deleting genre:', error);
      toast.error('Failed to delete genre. Make sure there are no books associated with this genre.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGenres();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Genres Management</h1>
          <p className="text-slate-400 mt-1">Create and manage book genres</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setGenreName('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Genre
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
              placeholder="Search genres..."
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

      {/* Grid/Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : genres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Tag className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No genres found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Add your first genre
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  className="flex items-center justify-between px-4 py-3 bg-slate-700/50 rounded-lg group hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-medium">{genre.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(genre)}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(genre.id)}
                      disabled={deletingId === genre.id}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === genre.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowModal(false); setGenreName(''); setEditingId(null); }} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Genre' : 'Add New Genre'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setGenreName('');
                  setEditingId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre Name *</label>
                <input
                  type="text"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  placeholder="e.g., Science Fiction"
                  required
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setGenreName('');
                    setEditingId(null);
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
                  {editingId ? 'Update Genre' : 'Create Genre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenres;
