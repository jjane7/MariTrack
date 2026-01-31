import { useState } from 'react';
import { Plus, Calendar, DollarSign, Tag, Package, Hash } from 'lucide-react';
import { CATEGORIES, STATUS_ORDER, generateId } from '../utils';

const ExpenseForm = ({ onAddOrder }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        price: '',
        category: 'Electronics',
        purchaseDate: new Date().toISOString().split('T')[0],
        trackingNumber: '',
        status: 'Ordered',
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.itemName || !formData.price) {
            return;
        }

        const newOrder = {
            id: generateId(),
            ...formData,
            price: parseFloat(formData.price),
            carrier: 'USPS',
            createdAt: new Date().toISOString(),
        };

        onAddOrder(newOrder);

        // Reset form
        setFormData({
            itemName: '',
            price: '',
            category: 'Electronics',
            purchaseDate: new Date().toISOString().split('T')[0],
            trackingNumber: '',
            status: 'Ordered',
        });
        setIsExpanded(false);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <Plus className={`w-5 h-5 text-white transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
                    </div>
                    <span className="font-semibold text-white text-lg">Add New Order</span>
                </div>
                <span className="text-white/50 text-sm">{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
            </button>

            {/* Form - Expandable */}
            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
                    {/* Item Name */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                            <Package className="w-4 h-4" />
                            Item Name
                        </label>
                        <input
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => handleChange('itemName', e.target.value)}
                            placeholder="e.g., Wireless Earbuds"
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Price and Category Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <DollarSign className="w-4 h-4" />
                                Price (PHP)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                placeholder="0.00"
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <Tag className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="select-field"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date and Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <Calendar className="w-4 h-4" />
                                Purchase Date
                            </label>
                            <input
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-white/70">
                                <Package className="w-4 h-4" />
                                Initial Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="select-field"
                            >
                                {STATUS_ORDER.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tracking Number */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                            <Hash className="w-4 h-4" />
                            Tracking Number (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.trackingNumber}
                            onChange={(e) => handleChange('trackingNumber', e.target.value)}
                            placeholder="Enter tracking number if available"
                            className="input-field"
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
