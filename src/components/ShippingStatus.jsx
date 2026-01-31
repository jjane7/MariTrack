import { getStatusColor, getCarrierUrl, STATUS_ORDER, CARRIERS } from '../utils';
import { ExternalLink, Package, Truck, PackageCheck, Home } from 'lucide-react';

const ShippingStatus = ({ order, onStatusChange, onTrackingChange, onCarrierChange }) => {
    const statusColors = getStatusColor(order.status);

    // Get icon for each status
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Ordered':
                return <Package className="w-4 h-4" />;
            case 'Shipped':
                return <Truck className="w-4 h-4" />;
            case 'Out for Delivery':
                return <PackageCheck className="w-4 h-4" />;
            case 'Arrived':
                return <Home className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    // Get current status index
    const currentIndex = STATUS_ORDER.indexOf(order.status);

    return (
        <div className="space-y-4">
            {/* Status Timeline */}
            <div className="flex items-center justify-between gap-1">
                {STATUS_ORDER.map((status, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = status === order.status;
                    const colors = getStatusColor(status);

                    return (
                        <div key={status} className="flex-1 flex flex-col items-center">
                            {/* Status Dot */}
                            <button
                                onClick={() => onStatusChange(order.id, status)}
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${isActive ? colors.bg + ' ' + colors.text : 'bg-white/10 text-white/30'}
                  ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-slate-900 ' + colors.border.replace('border-', 'ring-') : ''}
                `}
                                title={status}
                            >
                                {getStatusIcon(status)}
                            </button>

                            {/* Status Label (only on larger screens) */}
                            <span className={`text-[10px] mt-1 hidden sm:block ${isActive ? 'text-white/70' : 'text-white/30'}`}>
                                {status}
                            </span>

                            {/* Progress Line */}
                            {index < STATUS_ORDER.length - 1 && (
                                <div className="absolute hidden" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
                />
            </div>

            {/* Status Section */}
            <div className="flex gap-2">
                {order.source === 'gmail' ? (
                    <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                        <span className="font-medium text-white">{order.status}</span>
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                            Automated by TikTok
                        </span>
                    </div>
                ) : (
                    <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        className="select-field flex-1"
                    >
                        {STATUS_ORDER.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Tracking Section */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    {order.source === 'gmail' ? (
                        <div className="flex-1 flex gap-2">
                            <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 text-white/70 font-mono text-sm">
                                {order.trackingNumber || 'No tracking number'}
                            </div>
                            <div className="w-24 p-3 bg-white/5 rounded-lg border border-white/10 text-white center text-center">
                                {order.carrier || 'Standard'}
                            </div>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={order.trackingNumber || ''}
                                onChange={(e) => onTrackingChange(order.id, e.target.value)}
                                placeholder="Enter tracking number"
                                className="input-field flex-1"
                            />
                            <select
                                value={order.carrier || 'USPS'}
                                onChange={(e) => onCarrierChange(order.id, e.target.value)}
                                className="select-field w-24"
                            >
                                {CARRIERS.map(carrier => (
                                    <option key={carrier} value={carrier}>{carrier}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* Carrier Link Button */}
                {order.trackingNumber && (
                    <a
                        href={getCarrierUrl(order.carrier || 'USPS', order.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-flex items-center gap-2 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Track on {order.carrier || 'USPS'}
                    </a>
                )}
            </div>
        </div>
    );
};

export default ShippingStatus;
