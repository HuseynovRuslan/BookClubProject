import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, BookOpen, Eye, EyeOff, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Check for email verification success
  useEffect(() => {
    const verified = searchParams.get('verified') === 'true';
    const shouldLogout = searchParams.get('logout') === 'true';

    if (verified) {
      setEmailVerified(true);

      // If shouldLogout is true, logout the user to force fresh token on next login
      if (shouldLogout && isAuthenticated) {
        // Logout silently without toast
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.reload(); // Reload to clear state
        return;
      }

      toast.success('Email verified successfully! Please login to continue with full access.');
      // Clean up the URL
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, isAuthenticated]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setApiError('');
    const result = await login(data.usernameOrEmail, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 text-stone-600">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BookClub</span>
          </div>

          {/* Quote Section */}
          <div className="max-w-md">
            <blockquote className="text-3xl font-light text-white/90 leading-relaxed mb-6">
              "A room without books is like a body without a soul."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-12 h-0.5 bg-amber-500/60" />
              <p className="text-white/60 font-medium">Marcus Tullius Cicero</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-white/60 text-sm">Books Available</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5K+</p>
              <p className="text-white/60 text-sm">Active Readers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1M+</p>
              <p className="text-white/60 text-sm">Reviews Written</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">BookClub</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-stone-500">
              Sign in to continue your reading journey
            </p>
          </div>

          {/* Email Verified Success */}
          {emailVerified && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 text-sm font-medium">
                Email verified successfully! You can now login with full access.
              </p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-stone-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="usernameOrEmail"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your email or username"
                  className={`
                    block w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.usernameOrEmail
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('usernameOrEmail', {
                    required: 'Email or username is required',
                    minLength: {
                      value: 3,
                      message: 'Must be at least 3 characters',
                    },
                  })}
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="mt-2 text-sm text-red-600">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`
                    block w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full flex items-center justify-center gap-2
                bg-stone-900 hover:bg-stone-800 text-white
                font-semibold py-4 px-6 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
              "
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-stone-50 text-stone-500">New to BookClub?</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="
              w-full flex items-center justify-center gap-2
              bg-white hover:bg-stone-50 text-stone-900
              font-semibold py-4 px-6 rounded-xl border-2 border-stone-200
              focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
              transition-all hover:border-stone-300
            "
          >
            <span>Create an Account</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-stone-500">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-stone-700 hover:text-stone-900 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-stone-700 hover:text-stone-900 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
