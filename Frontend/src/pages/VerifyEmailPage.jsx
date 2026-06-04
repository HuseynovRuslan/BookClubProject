import { useState } from 'react';
import { Mail, RefreshCw, LogOut, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyEmailPage = () => {
    const { user, resendConfirmationEmail, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [checking, setChecking] = useState(false);

    const handleResendEmail = async () => {
        setSending(true);
        const result = await resendConfirmationEmail();
        setSending(false);
        if (result.success) {
            setSent(true);
        }
    };

    const handleCheckStatus = async () => {
        setChecking(true);
        const result = await refreshUser();
        setChecking(false);

        if (result.success && result.emailConfirmed) {
            toast.success('Email verified! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } else {
            toast.warning('Email not verified yet. Please check your inbox.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-amber-600" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-stone-900 mb-2">
                    Email Verification Required
                </h1>

                {/* Description */}
                <p className="text-stone-600 mb-6">
                    To access all features of Bookla, please verify your email address.
                    {user?.email && (
                        <span className="block mt-2 font-medium text-stone-800">
                            {user.email}
                        </span>
                    )}
                </p>

                {/* Success message */}
                {sent && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-emerald-700 text-sm">
                            Verification email sent! Check your inbox (and spam folder).
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {/* Check status button - PRIMARY */}
                    <button
                        onClick={handleCheckStatus}
                        disabled={checking}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {checking ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Checking...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>I Have Verified My Email</span>
                            </>
                        )}
                    </button>

                    {/* Send email button */}
                    <button
                        onClick={handleResendEmail}
                        disabled={sending}
                        className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Mail className="w-5 h-5" />
                                <span>Send Verification Email</span>
                            </>
                        )}
                    </button>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-medium py-3 px-6 rounded-xl border-2 border-stone-200 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left">
                    <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                        <li>Click "Send Verification Email"</li>
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>Come back here and click "I Have Verified My Email"</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
