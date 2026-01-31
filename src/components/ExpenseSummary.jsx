import { useMemo } from 'react';
import { formatCurrency, CATEGORIES } from '../utils';
import { PieChart, TrendingUp, Wallet } from 'lucide-react';

const ExpenseSummary = ({ orders, budgetLimit, onBudgetChange }) => {
    // Calculate statistics
    const stats = useMemo(() => {
        const totalSpent = orders.reduce((sum, order) => sum + Number(order.price), 0);
        const arrivedTotal = orders.filter(o => o.status === 'Arrived')
            .reduce((sum, order) => sum + Number(order.price), 0);

        // Category breakdown
        const categoryBreakdown = CATEGORIES.map(cat => {
            const catOrders = orders.filter(o => o.category === cat);
            const total = catOrders.reduce((sum, order) => sum + Number(order.price), 0);
            return {
                category: cat,
                total,
                count: catOrders.length,
                percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
            };
        }).filter(c => c.count > 0).sort((a, b) => b.total - a.total);

        return {
            totalSpent,
            arrivedTotal,
            categoryBreakdown,
            orderCount: orders.length,
        };
    }, [orders]);

    // Category colors
    const categoryColors = {
        'Electronics': 'bg-blue-500',
        'Fashion': 'bg-pink-500',
        'Beauty': 'bg-purple-500',
        'Home': 'bg-green-500',
        'Food': 'bg-orange-500',
        'Other': 'bg-gray-500',
    };

    return (
        <div className="glass-card p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Expense Summary
                </h3>
                <span className="text-sm text-white/50">{stats.orderCount} orders</span>
            </div>

            {/* Total Spent Card */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white/60 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                </div>
            </div>

            {/* Monthly Budget Input */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-white/70">
                    <TrendingUp className="w-4 h-4" />
                    Monthly Budget Limit
                </label>
                <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => onBudgetChange(parseFloat(e.target.value) || 0)}
                    placeholder="Set your budget limit"
                    className="input-field"
                    min="0"
                    step="100"
                />
            </div>

            {/* Category Breakdown */}
            {stats.categoryBreakdown.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/70">Spending by Category</h4>

                    {stats.categoryBreakdown.map((cat) => (
                        <div key={cat.category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">{cat.category}</span>
                                <span className="text-white font-medium">{formatCurrency(cat.total)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${categoryColors[cat.category]} transition-all duration-500`}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Received Items Total */}
            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Received Items Value</span>
                    <span className="text-emerald-400 font-semibold">{formatCurrency(stats.arrivedTotal)}</span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSummary;
