# 🔔 Notification System Implementation

## Overview
A modern, real-time notification system has been successfully integrated into the frontend, featuring a Facebook-style dropdown UI with SignalR real-time updates.

---

## 📁 Files Created/Modified

### 1. **API Service** (`src/api/notifications.js`)
Contains all notification-related API calls:
- `getNotifications(page, pageSize)` - Fetch paginated notifications
- `getUnreadCount()` - Get unread notification count
- `markAsRead(id)` - Mark a single notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(id)` - Delete a notification

### 2. **NotificationDropdown Component** (`src/components/NotificationDropdown.jsx`)
Beautiful, modern dropdown component with:
- **Bell Icon** with animated red badge showing unread count
- **Shake Animation** when new notifications arrive
- **Glassmorphism Panel** with clean, minimal design
- **Rich Notifications** with:
  - Actor profile pictures (circular avatars)
  - Notification type icons (Heart, MessageCircle, UserPlus, Star, etc.)
  - Rich text content with bold names
  - Relative timestamps ("2 mins ago")
  - Unread state (light blue background + blue dot)
  - Hover-to-delete (X button)
- **Infinite Scroll** with "Load More" button
- **Click-to-Navigate** - Automatically routes to relevant content
- **Mark All as Read** button in header

### 3. **SignalR Service** (`src/services/signalrService.js`)
Updated to support dual-hub connections:
- **Messages Hub** - Existing chat functionality
- **Notifications Hub** - New notification events
- Handles `ReceiveNotification` event from backend
- Auto-reconnection with exponential backoff

### 4. **SignalR Context** (`src/context/SignalRContext.jsx`)
Enhanced with notification state management:
- `newNotification` - Latest notification from SignalR
- `notificationUnreadCount` - Current unread count
- `clearNewNotification()` - Clear processed notification
- `setNotificationCount(count)` - Update count from API

### 5. **HomePage** (`src/pages/HomePage.jsx`)
Integrated NotificationDropdown into navbar:
- Fetches initial unread count on mount
- Listens for real-time notifications via SignalR
- Automatically adds new notifications to dropdown
- Positioned between navigation and user menu

---

## 🎨 UI/UX Features

### Visual Design
- **Clean & Minimal** - Tailwind CSS with stone color palette
- **Glassmorphism** - Subtle gradient header (stone-50 to white)
- **Smooth Animations** - Shake, pulse, and hover transitions
- **Responsive** - Fixed 384px width (w-96), max 500px height
- **Accessibility** - Proper contrast, hover states, and focus indicators

### Interactions
1. **Click Bell** → Opens/closes dropdown
2. **Click Notification** → Marks as read + navigates to content
3. **Hover Notification** → Shows delete button
4. **Click Delete** → Removes notification
5. **Click "Mark all read"** → Marks all as read
6. **Scroll to Bottom** → "Load more" button appears
7. **New Notification Arrives** → Bell shakes + badge updates

### Notification Types & Icons
| Type | Icon | Color |
|------|------|-------|
| ReviewLike / QuoteLike | ❤️ Heart | Red |
| QuoteComment / ReviewComment | 💬 MessageCircle | Blue |
| UserFollow | 👥 UserPlus | Green |
| ReviewCreated | ⭐ Star | Amber |
| BookAddedToShelf | 📚 BookMarked | Purple |

---

## 🔌 Real-Time Integration

### SignalR Flow
1. **Connection**:
   - Connects to `/hubs/notifications` on authentication
   - Auto-reconnects on disconnect
   
2. **Event Listening**:
   - Listens for `ReceiveNotification` event
   - Updates `newNotification` state in SignalRContext
   
3. **Notification Handling**:
   - HomePage detects `newNotification` change
   - Calls `addNotificationCallback` to add to dropdown
   - Increments unread count
   - Triggers shake animation

4. **Sound (Optional)**:
   - Uncomment line in HomePage.jsx to play notification sound:
   ```javascript
   // new Audio('/notification-sound.mp3').play().catch(() => {});
   ```

---

## 🚀 Navigation Logic

When a notification is clicked, it navigates based on `relatedEntityType`:

| Entity Type | Destination |
|-------------|-------------|
| `book` | `/books/{relatedEntityId}` |
| `review` | `/books/{relatedEntityId}` (reviews shown on book page) |
| `quote` | `/` (home page with quotes carousel) |
| `user` | `/profile/{relatedEntityId}` |

---

## 📝 Usage in Other Pages

To add the notification dropdown to other pages (e.g., BrowseBooksPage, BookDetailsPage):

```jsx
import NotificationDropdown from '../components/NotificationDropdown';
import { useSignalR } from '../context/SignalRContext';
import { getUnreadCount } from '../api/notifications';

// In component:
const { 
  newNotification, 
  notificationUnreadCount, 
  clearNewNotification,
  setNotificationCount 
} = useSignalR();

const [addNotificationCallback, setAddNotificationCallback] = useState(null);

// Fetch unread count on mount
useEffect(() => {
  const fetchCount = async () => {
    const count = await getUnreadCount();
    setNotificationCount(count);
  };
  fetchCount();
}, []);

// Handle new notifications
useEffect(() => {
  if (newNotification && addNotificationCallback) {
    addNotificationCallback(newNotification);
    clearNewNotification();
  }
}, [newNotification]);

// In navbar JSX:
<NotificationDropdown 
  unreadCount={notificationUnreadCount}
  onNewNotification={(callback) => setAddNotificationCallback(() => callback)}
/>
```

---

## 🎯 Backend Requirements

### Controller Endpoints (Already Implemented ✅)
- `GET /api/notifications` - Get notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/{id}/mark-as-read` - Mark as read
- `POST /api/notifications/mark-all-as-read` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

### SignalR Hub (Already Implemented ✅)
- Hub URL: `/hubs/notifications`
- Event: `ReceiveNotification` - Sends notification DTO to user

### Notification DTO Structure
```csharp
{
  "id": "string",
  "userId": "string",
  "actorId": "string",
  "actor": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "profilePictureUrl": "string"
  },
  "type": 1-8, // NotificationTypeDto enum
  "relatedEntityId": "string",
  "relatedEntityType": "string",
  "title": "string",
  "message": "string",
  "isRead": false,
  "readAt": null,
  "createdAt": "2026-01-16T..."
}
```

---

## 🧪 Testing Checklist

- [ ] Bell icon appears in navbar when authenticated
- [ ] Badge shows correct unread count
- [ ] Clicking bell opens/closes dropdown
- [ ] Clicking outside closes dropdown
- [ ] Notifications load on dropdown open
- [ ] Unread notifications have blue background
- [ ] Clicking notification marks it as read
- [ ] Clicking notification navigates correctly
- [ ] "Mark all as read" works
- [ ] Delete (X) button removes notification
- [ ] "Load more" loads next page
- [ ] Real-time notification arrives via SignalR
- [ ] Bell shakes when new notification arrives
- [ ] Badge updates in real-time
- [ ] New notification appears at top of list

---

## 🎨 Customization

### Colors
Edit in `NotificationDropdown.jsx`:
- Unread background: `bg-blue-50/50`
- Badge color: `bg-red-500`
- Icon colors: See `getNotificationIcon()` function

### Animation Timing
```css
/* In component <style jsx> */
@keyframes shake {
  /* Adjust rotation degrees or timing */
}
.animate-shake {
  animation: shake 0.5s ease-in-out; /* Change duration */
}
```

### Dropdown Size
```jsx
// In NotificationDropdown.jsx
<div className="w-96 max-h-[500px]"> {/* Adjust width/height */}
```

---

## 🐛 Troubleshooting

### Notifications not appearing in real-time
1. Check browser console for SignalR connection errors
2. Verify backend NotificationsHub is running
3. Ensure JWT token is valid
4. Check CORS settings allow SignalR connections

### Badge count incorrect
1. Refresh page to fetch latest count from API
2. Check if `setNotificationCount()` is called on mount
3. Verify backend `GetUnreadCount` returns correct value

### Navigation not working
1. Check `relatedEntityType` and `relatedEntityId` in notification DTO
2. Verify routes exist in App.jsx
3. Add console.log in `navigateToEntity()` to debug

---

## 🚀 Future Enhancements

- [ ] Add notification sound file to `/public`
- [ ] Group notifications by date ("Today", "This Week")
- [ ] Add notification preferences (mute certain types)
- [ ] Add "Clear all" button
- [ ] Support for rich media (images, videos)
- [ ] Push notifications (browser API)
- [ ] Email digest for unread notifications
- [ ] Notification search/filter

---

## 📦 Dependencies

All required dependencies are already installed:
- `@microsoft/signalr` - Real-time communication
- `lucide-react` - Icons (Bell, Heart, X, etc.)
- `react-router-dom` - Navigation
- `axios` - API calls
- `tailwindcss` - Styling

---

## ✅ Implementation Complete!

The notification system is fully integrated and ready to use. All components are modular, well-documented, and follow React best practices. Enjoy your modern, real-time notification experience! 🎉
