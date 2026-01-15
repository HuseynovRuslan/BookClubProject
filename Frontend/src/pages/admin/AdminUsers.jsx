import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Mail,
  Calendar,
  Trash2,
} from 'lucide-react';
import { getAllUsers, deleteUser } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 10;

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, pageSize, debouncedSearchTerm);
      setUsers(data?.items || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Prevent admin from deleting themselves
    if (currentUser?.id === id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      toast.success('User deleted successfully');
      // Refresh the list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.title || 
                           error.message || 
                           'Failed to delete user';
      toast.error(errorMessage);
      
      // If 404, provide helpful message
      if (error.response?.status === 404) {
        console.error('Endpoint not found. Make sure backend is running and DeleteUser endpoint exists.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <p className="text-slate-400 mt-1">View registered users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No users found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Username</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                          {user.profilePictureUrl || user.profilePicture ? (
                            <img
                              src={getImageUrl(user.profilePictureUrl || user.profilePicture)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.userName || 'Anonymous'}
                          </p>
                          {user.bio && (
                            <p className="text-slate-400 text-xs truncate max-w-[200px]">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm font-mono">
                        @{user.username || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.id === user.id ? (
                        <span className="text-xs text-slate-500 italic">Current User</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
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
    </div>
  );
};

export default AdminUsers;
