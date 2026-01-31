import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true }, // TikTok Order ID
    title: String,
    price: Number,
    image: String,
    status: { type: String, default: 'Ordered' },
    date: { type: Date },
    emailId: { type: String }, // To prevent duplicates from same email
    source: { type: String, default: 'manual' }, // 'manual' or 'gmail'
    carrier: String,
    trackingNumber: String,
    createdAt: { type: Date, default: Date.now }
});

// Ensure (user + orderId) is unique so we don't save duplicates
orderSchema.index({ user: 1, orderId: 1 }, { unique: true });

export const Order = mongoose.model('Order', orderSchema);
