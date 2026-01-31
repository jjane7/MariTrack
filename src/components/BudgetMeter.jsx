import { useMemo } from 'react';
import { formatCurrency } from '../utils';

const BudgetMeter = ({ spent, limit }) => {
    const percentage = useMemo(() => {
        if (!limit || limit <= 0) return 0;
        return Math.min((spent / limit) * 100, 100);
    }, [spent, limit]);

    // Calculate stroke dashoffset for the arc
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 75% of circle

    // Color based on percentage
    const getGradientColor = () => {
        if (percentage >= 90) return { start: '#ef4444', end: '#dc2626' }; // Red
        if (percentage >= 70) return { start: '#f59e0b', end: '#d97706' }; // Amber
        return { start: '#22c55e', end: '#16a34a' }; // Green
    };

    const colors = getGradientColor();

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Budget Meter
            </h3>

            <div className="flex flex-col items-center">
                {/* SVG Gauge */}
                <div className="relative w-40 h-24 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 60">
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                        </defs>

                        {/* Background Arc */}
                        <path
                            d="M 10 55 A 45 45 0 0 1 90 55"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />

                        {/* Progress Arc */}
                        <path
                            d="M 10 55 A 45 45 0 0 1 90 55"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference * 0.5}
                            strokeDashoffset={circumference * 0.5 * (1 - percentage / 100)}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                        <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
                    </div>
                </div>

                {/* Amounts */}
                <div className="text-center space-y-1">
                    <p className="text-white/60 text-sm">
                        Spent: <span className="text-white font-semibold">{formatCurrency(spent)}</span>
                    </p>
                    <p className="text-white/60 text-sm">
                        Limit: <span className="text-white font-semibold">{formatCurrency(limit)}</span>
                    </p>
                </div>

                {/* Warning Message */}
                {percentage >= 90 && (
                    <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm font-medium">⚠️ Budget almost exhausted!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetMeter;
