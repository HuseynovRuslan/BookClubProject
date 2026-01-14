import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

/**
 * UserListModal - A reusable modal to display a list of users
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title (e.g., "Followers", "Following")
 * @param {Array} users - Array of user objects to display
 */
const UserListModal = ({ isOpen, onClose, title, users = [] }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500">No users to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const profilePicUrl = getImageUrl(user.profilePictureUrl);
                const initials = user.firstName && user.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`
                  : user.username?.[0]?.toUpperCase() || '?';
                const fullName = user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.username)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                      {profilePicUrl ? (
                        <img
                          src={profilePicUrl}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">
                        {fullName}
                      </p>
                      <p className="text-sm text-stone-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
