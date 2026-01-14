# Authentication System Implementation

## Overview
This is a complete, production-ready authentication system for React + Vite + Tailwind CSS v4, integrated with your .NET 8 Web API backend.

## 📁 Files Created

### 1. **src/api/axiosClient.js**
- Axios instance configured with `baseURL: http://localhost:5000/api`
- **Request Interceptor**: Automatically attaches JWT token from localStorage to all requests
- **Response Interceptor**: Handles 401 errors globally (clears storage and redirects to /login)

### 2. **src/context/AuthContext.jsx**
- Centralized authentication state management
- **State**: `user`, `token`, `isAuthenticated`, `loading`
- **Functions**:
  - `login(usernameOrEmail, password)` - Authenticates user and stores tokens
  - `register(data)` - Creates new user account
  - `logout()` - Clears authentication and redirects
- Auto-restores user session on app startup from localStorage

### 3. **src/pages/LoginPage.jsx**
- Modern, responsive login form with Tailwind CSS v4
- Uses `react-hook-form` for validation
- Icons from `lucide-react` (Mail, Lock)
- Real-time validation with error messages
- Success/error notifications via `react-toastify`

### 4. **src/pages/RegisterPage.jsx**
- Complete registration form with validation
- Fields: username, email, firstName, lastName, password, confirmPassword
- Password confirmation matching
- Redirects to login after successful registration

### 5. **src/pages/HomePage.jsx**
- Landing page with different views for authenticated/guest users
- Shows user information when logged in
- Navigation bar with login/logout functionality

### 6. **src/components/ProtectedRoute.jsx**
- Utility component for protecting authenticated routes
- Shows loading state while checking authentication
- Automatically redirects to /login if not authenticated

### 7. **src/App.jsx**
- React Router setup with routes:
  - `/` - HomePage
  - `/login` - LoginPage
  - `/register` - RegisterPage
- Wrapped with `AuthProvider` for global auth state

### 8. **src/main.jsx**
- Updated with `ToastContainer` for notifications
- Configured with sensible defaults (top-right, 3s auto-close)

## 🔧 API Integration

### Login Endpoint
```javascript
POST /api/auth/login
Request: { 
  "usernameOrEmail": "user@example.com",
  "password": "yourpassword"
}
Response: {
  "data": {
    "accessToken": "jwt-token...",
    "refreshToken": "refresh-token..."
  },
  "message": "Login successful"
}
```

### Register Endpoint
```javascript
POST /api/auth/register
Request: {
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
Response: {
  "data": "confirmation-message",
  "message": "Registration successful! Please check your email..."
}
```

### Logout Endpoint
```javascript
POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Response: { "message": "Logout successful" }
```

## 🚀 Usage Examples

### Using the Auth Context
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Protecting Routes
```jsx
import ProtectedRoute from './components/ProtectedRoute';

// In App.jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

### Making Authenticated API Calls
```javascript
import axiosClient from './api/axiosClient';

// The token is automatically attached by the interceptor
const fetchUserData = async () => {
  const response = await axiosClient.get('/users/profile');
  return response.data;
};
```

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, smooth transitions, rounded corners
- **Responsive**: Mobile-first design that works on all screen sizes
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
- **Icons**: Lucide React icons throughout for better UX
- **Loading States**: Spinners and disabled states during async operations
- **Error Handling**: Clear error messages with red styling
- **Toast Notifications**: Non-intrusive success/error messages

## 🔐 Security Features

- JWT tokens stored in localStorage
- Automatic token attachment to requests
- Global 401 error handling
- Secure password input fields
- Token expiration handling (via 401 interceptor)
- HTTPS-ready (change baseURL to production URL)

## 📝 Configuration

### Change API URL
Edit `src/api/axiosClient.js`:
```javascript
const axiosClient = axios.create({
  baseURL: 'https://your-production-api.com/api', // Update this
  // ...
});
```

### Customize Toast Notifications
Edit `src/main.jsx`:
```javascript
<ToastContainer
  position="top-right"  // Change position
  autoClose={5000}      // Change duration
  theme="dark"          // Change theme
  // ...
/>
```

## 🧪 Testing the Implementation

1. **Start the Backend**:
   ```bash
   cd Backend
   dotnet run --project Goodreads.API
   ```

2. **Start the Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Test Flow**:
   - Visit `http://localhost:5173` (or your Vite port)
   - Click "Sign Up" and create an account
   - Check your email for confirmation (if email service is configured)
   - Click "Sign In" and log in with your credentials
   - You should be redirected to the homepage as an authenticated user
   - Click "Logout" to end the session

## 🐛 Troubleshooting

### CORS Issues
If you get CORS errors, ensure your .NET backend has CORS configured:
```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### Token Not Persisting
- Check browser localStorage in DevTools (Application tab)
- Ensure `localStorage.setItem('token', ...)` is working
- Check for browser privacy settings blocking localStorage

### 401 Errors After Login
- Verify the JWT token format in the backend
- Check token expiration settings
- Ensure the Authorization header format is correct: `Bearer {token}`

## 🔄 Next Steps

1. **Add Refresh Token Logic**: Implement automatic token refresh when access token expires
2. **Email Confirmation**: Add UI for email confirmation flow
3. **Password Reset**: Create forgot password / reset password pages
4. **Profile Management**: Add user profile editing functionality
5. **Remember Me**: Add "Remember Me" checkbox for extended sessions
6. **Social Login**: Integrate OAuth providers (Google, Facebook, etc.)

## 📦 Dependencies

All required packages are already installed:
- `axios` - HTTP client
- `react-router-dom` - Routing
- `react-hook-form` - Form validation
- `react-toastify` - Toast notifications
- `lucide-react` - Icons
- `@tailwindcss/vite` - Tailwind CSS v4

## 📄 License

This implementation is part of the BookClub project.
