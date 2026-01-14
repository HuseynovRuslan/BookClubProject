import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Loader, CheckCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    const result = await forgotPassword(data.email);
    
    if (result.success) {
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } else {
      setApiError(result.message || 'Failed to send reset email. Please try again.');
    }
  };

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
              <span className="text-6xl">🔑</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Forgot Password?</h2>
            <p className="text-white/60 text-center max-w-sm">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Empty space for balance */}
          <div />
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

          {isSubmitted ? (
            /* Success State */
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-3">
                Check Your Email
              </h1>
              <p className="text-stone-500 mb-6">
                We've sent a password reset link to:
              </p>
              <div className="bg-stone-100 rounded-xl px-4 py-3 mb-8">
                <p className="font-medium text-stone-900">{submittedEmail}</p>
              </div>
              <p className="text-stone-500 text-sm mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-stone-900 font-medium hover:underline"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
                  Reset Password
                </h1>
                <p className="text-stone-500">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                      placeholder="Enter your email address"
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
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-stone-600">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-stone-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
