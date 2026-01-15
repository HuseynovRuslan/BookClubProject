import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Feather,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
  User,
  Pencil,
} from 'lucide-react';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../api/admin';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, [page, searchTerm]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await getAllAuthors(page, pageSize, searchTerm);
      setAuthors(data?.items || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (author) => {
    setEditingId(author.id);
    setFormData({
      name: author.name || '',
      bio: author.bio || '',
      profilePicture: null,
    });
    if (author.profilePictureUrl || author.profilePicture) {
      setImagePreview(getImageUrl(author.profilePictureUrl || author.profilePicture));
    } else {
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      
      if (editingId) {
        // Update mode
        submitData.append('AuthorId', editingId);
        if (formData.name) submitData.append('Name', formData.name);
        if (formData.bio) submitData.append('Bio', formData.bio);
        if (formData.profilePicture) {
          submitData.append('ProfilePicture', formData.profilePicture);
        }

        await updateAuthor(submitData);
        toast.success('Author updated successfully');
      } else {
        // Create mode
        submitData.append('Name', formData.name);
        submitData.append('Bio', formData.bio);
        if (formData.profilePicture) {
          submitData.append('ProfilePicture', formData.profilePicture);
        }

        await createAuthor(submitData);
        toast.success('Author created successfully');
      }
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} author`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', bio: '', profilePicture: null });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author?')) return;

    try {
      setDeletingId(id);
      await deleteAuthor(id);
      toast.success('Author deleted successfully');
      fetchAuthors();
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error('Failed to delete author. Make sure there are no books associated with this author.');
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuthors();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Authors Management</h1>
          <p className="text-slate-400 mt-1">Create and manage authors</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Author
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
              placeholder="Search authors..."
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

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : authors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Feather className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No authors found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Add your first author
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Photo</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Bio</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Books</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden">
                        {author.profilePictureUrl || author.profilePicture ? (
                          <img
                            src={getImageUrl(author.profilePictureUrl || author.profilePicture)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{author.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm truncate max-w-md">
                        {author.bio || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm">{author.bookCount || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(author)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(author.id)}
                          disabled={deletingId === author.id}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === author.id ? (
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
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Author' : 'Add New Author'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  placeholder="Author name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Author biography"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors">
                    <Upload className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-sm text-slate-400">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
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
                  {editingId ? 'Update Author' : 'Create Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthors;
