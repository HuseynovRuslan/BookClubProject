import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, BookOpen, Eye, EyeOff, ArrowRight, Loader, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setApiError('');
    const result = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (result.success) {
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setApiError(result.message || 'Registration failed. Please try again.');
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
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">Bookla</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="text-amber-600 font-medium text-sm">Start your journey</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
              Join the Club
            </h1>
            <p className="text-stone-500">
              Create an account and discover your next favorite book
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Elçin"
                  className={`
                    block w-full px-4 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.firstName
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('firstName', {
                    required: 'Required',
                  })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-stone-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Məmmədov"
                  className={`
                    block w-full px-4 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.lastName
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('lastName', {
                    required: 'Required',
                  })}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="elchin_m"
                  className={`
                    block w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.username
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'At least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Letters, numbers, underscores only',
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="elchin@example.com"
                  className={`
                    block w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.email
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
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
                      message: 'At least 6 characters',
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
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className={`
                    block w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl
                    text-stone-900 placeholder:text-stone-400
                    focus:outline-none transition-all
                    ${errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-900'
                    }
                  `}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full flex items-center justify-center gap-2
                bg-stone-900 hover:bg-stone-800 text-white
                font-semibold py-4 px-6 rounded-xl mt-6
                focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
              "
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-stone-50 text-stone-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="
              w-full flex items-center justify-center gap-2
              bg-white hover:bg-stone-50 text-stone-900
              font-semibold py-4 px-6 rounded-xl border-2 border-stone-200
              focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
              transition-all hover:border-stone-300
            "
          >
            <span>Sign In Instead</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-stone-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="font-medium text-stone-700 hover:text-stone-900">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-stone-700 hover:text-stone-900">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-stone-900 via-stone-800 to-amber-900/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Bookla</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-amber-400 font-medium">Join 5,000+ readers</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Your personal library, anywhere you go
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Track your reading progress, discover new books, connect with fellow readers, and build your digital bookshelf.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                'Track unlimited books & reading goals',
                'Join reading challenges & discussions',
                'Personalized book recommendations',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/80 italic mb-4">
              "Bookla transformed my reading habits. I've read more books this year than ever before!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
                E
              </div>
              <div>
                <p className="text-white font-medium">Elvin M.</p>
                <p className="text-white/50 text-sm">52 books read in 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
