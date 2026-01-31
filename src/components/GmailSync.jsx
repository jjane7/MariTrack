import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GmailSync = ({ onImportOrders, userId }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [error, setError] = useState(null);

    // Check connection status when userId changes
    useEffect(() => {
        if (userId) {
            checkConnectionStatus();
        } else {
            setIsConnected(false);
        }
    }, [userId]);

    // Check URL params for OAuth callback (legacy check, user extraction handled in App.jsx)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('gmail_connected') === 'true') {
            setIsConnected(true);
            // Clean up URL handled in App.jsx mostly, but good to ensure
        } else if (urlParams.get('gmail_error') === 'true') {
            setError('Failed to connect Gmail. Please try again.');
        }
    }, []);


    const checkConnectionStatus = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/status?userId=${userId}`);
            const data = await response.json();
            setIsConnected(data.connected);
        } catch (err) {
            console.error('Failed to check status:', err);
            // Don't show error immediately on load, just stay disconnected
        } finally {
            setIsLoading(false);
        }
    };

    const connectGmail = () => {
        // Redirect to OAuth flow
        window.location.href = `${API_URL}/auth/google`;
    };

    const disconnectGmail = async () => {
        // In local mode token was global, in DB mode we might want to clear tokens from DB
        // For now, client-side disconnect is enough visual feedback
        setIsConnected(false);
        setSyncResult(null);
        // Ideally call an endpoint to clear tokens in DB for this user
    };

    const syncOrders = async () => {
        if (!userId) {
            setError("User identification missing. Please refresh.");
            return;
        }

        setIsSyncing(true);
        setError(null);
        setSyncResult(null);

        try {
            const response = await fetch(`${API_URL}/api/sync-orders?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setSyncResult(data);
                if (data.orders && data.orders.length > 0 && onImportOrders) {
                    onImportOrders(data.orders);
                }
            } else {
                setError(data.error || 'Sync failed');
            }
        } catch (err) {
            setError('Failed to sync orders. Check if server is running.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-red-400" />
                    Gmail Sync
                </h3>
                {isConnected && (
                    <span className="flex items-center gap-1 text-sm text-emerald-400">
                        <Check className="w-4 h-4" />
                        Connected
                    </span>
                )}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Connection Status */}
                    {!isConnected ? (
                        <div className="space-y-3">
                            <p className="text-sm text-white/60">
                                Connect your Gmail to automatically import TikTok order confirmations.
                            </p>
                            <button
                                onClick={connectGmail}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                Connect Gmail Account
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Sync Button */}
                            <button
                                onClick={syncOrders}
                                disabled={isSyncing}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSyncing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Sync Orders from Gmail
                                    </>
                                )}
                            </button>

                            {/* Disconnect Button */}
                            <button
                                onClick={disconnectGmail}
                                className="text-sm text-white/50 hover:text-white/70 transition-colors"
                            >
                                Disconnect Gmail
                            </button>
                        </div>
                    )}

                    {/* Sync Result */}
                    {syncResult && (
                        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                            <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {syncResult.message}
                            </p>
                            {syncResult.orders?.length > 0 && (
                                <p className="text-emerald-400/70 text-xs mt-1">
                                    {syncResult.orders.length} orders imported
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Server Status Hint */}
                    <p className="text-xs text-white/40 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Backend: http://localhost:3001
                    </p>
                </div>
            )}
        </div>
    );
};

export default GmailSync;
