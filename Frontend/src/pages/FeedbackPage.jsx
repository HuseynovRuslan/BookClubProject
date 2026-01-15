import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquareText,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { sendFeedback } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const FeedbackPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    if (formData.subject.length > 200) {
      toast.error('Subject must not exceed 200 characters');
      return;
    }

    try {
      setSubmitting(true);
      await sendFeedback({
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      
      setSubmitted(true);
      toast.success('Thank you! Your feedback has been sent successfully.');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending feedback:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.description ||
        'Failed to send feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold text-stone-900">Send Feedback</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Success State */}
          {submitted ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Thank You!</h2>
              <p className="text-stone-600 mb-6">
                Your feedback has been sent successfully. We appreciate your input!
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ subject: '', message: '' });
                }}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors"
              >
                Send Another Feedback
              </button>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-900 font-medium mb-1">We value your feedback!</p>
                    <p className="text-xs text-amber-700">
                      Share your thoughts, suggestions, or report any issues. We read every message and use your feedback to improve BookClub.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your feedback"
                    maxLength={200}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="mt-1 text-xs text-stone-500">
                    {formData.subject.length}/200 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={8}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.subject.trim() || !formData.message.trim()}
                    className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-stone-100 rounded-xl">
          <p className="text-sm text-stone-600 text-center">
            <span className="font-medium">Tip:</span> Be specific about your feedback. Include details about what you liked, what could be improved, or any bugs you encountered.
          </p>
        </div>
      </main>
    </div>
  );

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-lg p-8 text-center">
          <MessageSquareText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Login Required</h2>
          <p className="text-stone-600 mb-6">
            Please log in to send feedback. We need to know who you are to respond to your message.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="flex-1 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return content;
};

export default FeedbackPage;
