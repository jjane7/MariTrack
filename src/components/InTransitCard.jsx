import { Truck, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils';

const InTransitCard = ({ orders }) => {
    // Calculate in-transit items (not yet arrived)
    const inTransitOrders = orders.filter(order => order.status !== 'Arrived');
    const inTransitValue = inTransitOrders.reduce((sum, order) => sum + Number(order.price), 0);
    const inTransitCount = inTransitOrders.length;

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-400" />
                        In-Transit Value
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center pulse-glow">
                        <Package className="w-5 h-5 text-blue-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Total Value */}
                    <div className="flex items-baseline gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        <span className="text-3xl font-bold text-white">{formatCurrency(inTransitValue)}</span>
                    </div>

                    {/* Count Badge */}
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                            {inTransitCount} {inTransitCount === 1 ? 'item' : 'items'} in transit
                        </span>
                    </div>

                    {/* Status Breakdown */}
                    {inTransitCount > 0 && (
                        <div className="pt-4 border-t border-white/10 space-y-2">
                            {['Ordered', 'Shipped', 'Out for Delivery'].map(status => {
                                const count = orders.filter(o => o.status === status).length;
                                if (count === 0) return null;
                                return (
                                    <div key={status} className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">{status}</span>
                                        <span className="text-white font-medium">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InTransitCard;
