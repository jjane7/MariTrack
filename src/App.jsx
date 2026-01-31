import { useState, useEffect } from 'react';
import { ShoppingBag, Package, TrendingUp, Sparkles } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import OrderCard from './components/OrderCard';
import ExpenseSummary from './components/ExpenseSummary';
import BudgetMeter from './components/BudgetMeter';
import InTransitCard from './components/InTransitCard';
import GmailSync from './components/GmailSync';

// localStorage keys
const STORAGE_KEYS = {
  ORDERS: 'tiktok-orders',
  BUDGET: 'tiktok-budget-limit',
};

function App() {
  // State
  const [orders, setOrders] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(10000);
  const [filter, setFilter] = useState('all');

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);

    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to load orders:', e);
      }
    }

    if (savedBudget) {
      setBudgetLimit(parseFloat(savedBudget));
    }
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Save budget to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, String(budgetLimit));
  }, [budgetLimit]);

  // Add new order
  const handleAddOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Import orders from Gmail
  const handleImportOrders = (importedOrders) => {
    // Filter out duplicates based on emailId or orderId
    const newOrders = importedOrders.filter(imported => {
      return !orders.some(existing =>
        (imported.emailId && existing.emailId === imported.emailId) ||
        (imported.orderId && existing.orderId === imported.orderId)
      );
    });
    if (newOrders.length > 0) {
      setOrders(prev => [...newOrders, ...prev]);
    }
  };

  // Delete order
  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Update order
  const handleUpdateOrder = (orderId, updates) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  // Update status
  const handleStatusChange = (orderId, newStatus) => {
    handleUpdateOrder(orderId, { status: newStatus });
  };

  // Update tracking number
  const handleTrackingChange = (orderId, trackingNumber) => {
    handleUpdateOrder(orderId, { trackingNumber });
  };

  // Update carrier
  const handleCarrierChange = (orderId, carrier) => {
    handleUpdateOrder(orderId, { carrier });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'in-transit') return order.status !== 'Arrived';
    if (filter === 'arrived') return order.status === 'Arrived';
    return true;
  });

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.price), 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  TikTok Order & Expense Pro
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h1>
                <p className="text-sm text-white/60">Track your shopping & deliveries</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/60">Total Orders</p>
                <p className="text-lg font-semibold text-white">{orders.length}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <p className="text-sm text-white/60">In Transit</p>
                <p className="text-lg font-semibold text-blue-400">
                  {orders.filter(o => o.status !== 'Arrived').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BudgetMeter spent={totalSpent} limit={budgetLimit} />
          <InTransitCard orders={orders} />
          <ExpenseSummary
            orders={orders}
            budgetLimit={budgetLimit}
            onBudgetChange={setBudgetLimit}
          />
          <GmailSync onImportOrders={handleImportOrders} />
        </div>

        {/* Add Order Form */}
        <div className="mb-8">
          <ExpenseForm onAddOrder={handleAddOrder} />
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          {/* Section Header with Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Your Orders
              <span className="text-sm text-white/50 font-normal">({filteredOrders.length})</span>
            </h2>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'in-transit', label: 'In Transit' },
                { key: 'arrived', label: 'Arrived' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${filter === key
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDelete={handleDeleteOrder}
                  onUpdate={handleUpdateOrder}
                  onStatusChange={handleStatusChange}
                  onTrackingChange={handleTrackingChange}
                  onCarrierChange={handleCarrierChange}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium text-white/70 mb-2">No orders yet</h3>
              <p className="text-white/50">
                {filter !== 'all'
                  ? 'No orders match this filter. Try selecting "All" to see all orders.'
                  : 'Add your first TikTok order using the form above!'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-white/10">
        <p className="text-center text-white/40 text-sm">
          TikTok Order & Expense Pro • Built with React & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}

export default App;
