import { useState } from 'react';
import { AlertTriangle, Mail, X, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Email Verification Banner Component
 * Shows a warning banner when user's email is not verified
 * Includes a "Resend Email" button
 */
const EmailVerificationBanner = () => {
  const { user, isAuthenticated, emailConfirmed, resendConfirmationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if:
  // - Not authenticated
  // - Email is confirmed
  // - User dismissed the banner
  // - Already sent (show success state instead)
  if (!isAuthenticated || emailConfirmed || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    const result = await resendConfirmationEmail();
    setSending(false);
    
    if (result.success) {
      setSent(true);
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setDismissed(true);
      }, 5000);
    }
  };

  return (
    <div className={`
      ${sent ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}
      border-b transition-colors duration-300
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {sent ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            )}
            
            <div className="min-w-0">
              {sent ? (
                <p className="text-sm text-emerald-800">
                  <span className="font-medium">Verification email sent!</span>
                  {' '}Check your inbox at <span className="font-medium">{user?.email}</span>
                </p>
              ) : (
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Email not verified.</span>
                  {' '}
                  <span className="hidden sm:inline">
                    Some features like Chat and Reviews are limited.
                  </span>
                  <span className="sm:hidden">
                    Some features are limited.
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!sent && (
              <button
                onClick={handleResend}
                disabled={sending}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 
                  bg-amber-600 hover:bg-amber-700 
                  text-white text-sm font-medium rounded-lg
                  transition-colors disabled:opacity-50
                "
              >
                {sending ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Resend Email</span>
                    <span className="sm:hidden">Resend</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => setDismissed(true)}
              className={`
                p-1.5 rounded-lg transition-colors
                ${sent 
                  ? 'text-emerald-600 hover:bg-emerald-100' 
                  : 'text-amber-600 hover:bg-amber-100'
                }
              `}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
