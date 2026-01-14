import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, ArrowLeft, Loader, CheckCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  // Validate URL params on mount
  useEffect(() => {
    if (!userId || !token) {
      toast.error('Invalid password reset link');
      navigate('/forgot-password');
    }
  }, [userId, token, navigate]);

  const onSubmit = async (data) => {
    setApiError('');
    
    const result = await resetPassword(userId, token, data.password);
    
    if (result.success) {
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } else {
      setApiError(result.message || 'Failed to reset password. Please try again.');
    }
  };

  // Invalid link state
  if (!userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Invalid Link</h1>
          <p className="text-stone-500 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors"
          >
            Request New Link
          </Link>
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
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BookClub</span>
          </Link>

          {/* Icon Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
              <span className="text-6xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Create New Password</h2>
            <p className="text-white/60 text-center max-w-sm">
              Choose a strong password to protect your account. Make sure it's at least 8 characters long.
            </p>
          </div>

          {/* Password Tips */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Password Tips:</h3>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                At least 8 characters long
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Mix of uppercase and lowercase letters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Include numbers and special characters
              </li>
            </ul>
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

          {/* Back Link */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </Link>

          {isSuccess ? (
            /* Success State */
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-3">
                Password Reset!
              </h1>
              <p className="text-stone-500 mb-8">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
                  Create New Password
                </h1>
                <p className="text-stone-500">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter new password"
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
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain uppercase, lowercase, and number',
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
                      placeholder="Confirm new password"
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
                        required: 'Please confirm your password',
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
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full flex items-center justify-center gap-2 py-3.5
                    bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400
                    text-white font-semibold rounded-xl
                    transition-all duration-200
                  "
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
