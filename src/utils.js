// Format currency to Philippine Peso
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Calculate days since a given date
export const calculateDaysSince = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - orderDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Get status color classes based on status
export const getStatusColor = (status) => {
    const colors = {
        'Ordered': {
            bg: 'bg-red-500/20',
            text: 'text-red-400',
            border: 'border-red-500/30',
            dot: 'bg-red-500',
        },
        'Shipped': {
            bg: 'bg-amber-500/20',
            text: 'text-amber-400',
            border: 'border-amber-500/30',
            dot: 'bg-amber-500',
        },
        'Out for Delivery': {
            bg: 'bg-blue-500/20',
            text: 'text-blue-400',
            border: 'border-blue-500/30',
            dot: 'bg-blue-500',
        },
        'Arrived': {
            bg: 'bg-emerald-500/20',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30',
            dot: 'bg-emerald-500',
        },
    };
    return colors[status] || colors['Ordered'];
};

// Generate tracking URL for common carriers
export const getCarrierUrl = (carrier, trackingNumber) => {
    if (!trackingNumber) return '#';

    const carriers = {
        'USPS': `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
        'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
        'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
        'DHL': `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
        'J&T': `https://www.jtexpress.ph/trajectoryQuery?waybillNo=${trackingNumber}`,
        'LBC': `https://www.lbcexpress.com/track/?tracking_no=${trackingNumber}`,
    };

    return carriers[carrier] || '#';
};

// Get category icon name
export const getCategoryIcon = (category) => {
    const icons = {
        'Electronics': 'Smartphone',
        'Fashion': 'Shirt',
        'Beauty': 'Sparkles',
        'Home': 'Home',
        'Food': 'UtensilsCrossed',
        'Other': 'Package',
    };
    return icons[category] || 'Package';
};

// Generate unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Status progression order
export const STATUS_ORDER = ['Ordered', 'Shipped', 'Out for Delivery', 'Arrived'];

// Categories list
export const CATEGORIES = ['Electronics', 'Fashion', 'Beauty', 'Home', 'Food', 'Other'];

// Carriers list
export const CARRIERS = ['USPS', 'FedEx', 'UPS', 'DHL', 'J&T', 'LBC'];
