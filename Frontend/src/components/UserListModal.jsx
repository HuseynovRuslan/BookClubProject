import { Link } from 'react-router-dom';
import { Avatar, Dialog, Eyebrow, Icon } from './app/ui';
import { displayName } from './app/format';
import '../styles/app/profile.css';

// Helper to check if user is admin
const isAdmin = (user) => {
  if (!user) return false;
  const isAdminByRole = user?.role === 'Admin' ||
         user?.roles?.includes('Admin') ||
         user?.userRole === 'Admin' ||
         (Array.isArray(user?.roles) && user.roles.some(r => r === 'Admin' || r?.name === 'Admin'));
  const isAdminByUsername = user?.username?.toLowerCase() === 'admin' ||
                            user?.username?.toLowerCase().startsWith('admin_');
  return isAdminByRole || isAdminByUsername;
};

/**
 * UserListModal - A reusable modal to display a list of users (Make Dialog with avatar rows)
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title (e.g., "İzləyicilər", "İzlənilənlər")
 * @param {Array} users - Array of user objects to display
 * @param {string} [eyebrow] - Small line above the title (e.g. whose list it is)
 */
const UserListModal = ({ isOpen, onClose, title, users = [], eyebrow }) => {
  if (!isOpen) return null;

  const visibleUsers = users.filter((u) => !isAdmin(u));

  return (
    <Dialog className="user-list-modal" labelledBy="user-list-title" onClose={onClose}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id="user-list-title">{title}</h2>

      {visibleUsers.length === 0 ? (
        <p className="user-list-empty">Burada hələ heç kim yoxdur.</p>
      ) : (
        <ul className="user-list">
          {visibleUsers.map((user) => {
            const fullName = displayName(user);
            return (
              <li key={user.id}>
                <Link onClick={onClose} to={`/profile/${user.username || user.id}`}>
                  <Avatar name={fullName} size="medium" src={user.profilePictureUrl} />
                  <span>
                    <strong>{fullName}</strong>
                    {user.username && <small>@{user.username}</small>}
                  </span>
                  <Icon name="arrow" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
};

export default UserListModal;
