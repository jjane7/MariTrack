import { useState } from 'react';
import { formatCurrency, getStatusColor, calculateDaysSince, CATEGORIES } from '../utils';
import { Trash2, Edit3, Clock, Tag, Calendar, ChevronDown, ChevronUp, Smartphone, Shirt, Sparkles, Home, UtensilsCrossed, Package } from 'lucide-react';
import ShippingStatus from './ShippingStatus';

const OrderCard = ({ order, onDelete, onUpdate, onStatusChange, onTrackingChange, onCarrierChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        itemName: order.itemName,
        price: order.price,
        category: order.category,
    });

    const statusColors = getStatusColor(order.status);
    const daysSince = calculateDaysSince(order.purchaseDate);

    // Get category icon
    const getCategoryIcon = () => {
        const icons = {
            'Electronics': Smartphone,
            'Fashion': Shirt,
            'Beauty': Sparkles,
            'Home': Home,
            'Food': UtensilsCrossed,
            'Other': Package,
        };
        const Icon = icons[order.category] || Package;
        return <Icon className="w-4 h-4" />;
    };

    const handleSaveEdit = () => {
        onUpdate(order.id, {
            itemName: editData.itemName,
            price: parseFloat(editData.price),
            category: editData.category,
        });
        setIsEditing(false);
    };

    return (
        <div className="glass-card order-card overflow-hidden">
            {/* Main Card Header */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Item Info */}
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editData.itemName}
                                    onChange={(e) => setEditData(prev => ({ ...prev, itemName: e.target.value }))}
                                    className="input-field text-lg font-semibold"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editData.price}
                                        onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                        className="input-field w-32"
                                    />
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                                        className="select-field flex-1"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} className="btn-primary text-sm py-2">Save</button>
                                    <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm py-2">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-white truncate">{order.itemName}</h3>
                                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    {formatCurrency(order.price)}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Right: Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                        <span className={`
              status-badge px-3 py-1 rounded-full text-sm font-medium
              ${statusColors.bg} ${statusColors.text} border ${statusColors.border}
            `}>
                            <span className={`inline-block w-2 h-2 rounded-full ${statusColors.dot} mr-2`}></span>
                            {order.status}
                        </span>

                        {/* Days Since Order */}
                        <div className="flex items-center gap-1 text-white/50 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{daysSince} {daysSince === 1 ? 'day' : 'days'} ago</span>
                        </div>
                    </div>
                </div>

                {/* Meta Info Row - Only category and date */}
                {!isEditing && (
                    <div className="mt-3">
                        <div className="flex items-center gap-4 text-sm text-white/60">
                            <span className="flex items-center gap-1">
                                {getCategoryIcon()}
                                {order.category}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.purchaseDate).toLocaleDateString()}
                            </span>
                            {order.quantity && order.quantity > 1 && (
                                <span className="text-purple-400">×{order.quantity}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {!isEditing && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Hide Details
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show Details
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                title="Edit"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(order.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Section - Order Details & Shipping Status */}
            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-white/10 p-4 bg-white/5 space-y-4">
                    {/* Order Details */}
                    <div className="space-y-2">
                        {order.shopName && (
                            <div className="flex items-center gap-2">
                                <span className="text-white/50 text-sm">Shop:</span>
                                <span className="text-purple-400 font-medium">{order.shopName}</span>
                            </div>
                        )}
                        {/* Variant removed as requested */}
                        {order.orderId && (
                            <div className="flex items-center gap-2">
                                <span className="text-white/50 text-sm">Order ID:</span>
                                <span className="font-mono text-white/80 text-sm">{order.orderId}</span>
                            </div>
                        )}
                        {order.trackingNumber && (
                            <div className="flex items-center gap-2">
                                <span className="text-white/50 text-sm">Tracking:</span>
                                <span className="font-mono text-white/80 text-sm">{order.trackingNumber}</span>
                            </div>
                        )}
                    </div>

                    {/* Shipping Status */}
                    <ShippingStatus
                        order={order}
                        onStatusChange={onStatusChange}
                        onTrackingChange={onTrackingChange}
                        onCarrierChange={onCarrierChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
