import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { parseOrderEmails } from './services/emailParser.js';
import { searchTikTokEmails, getEmailContent } from './services/gmail.js';

dotenv.config();

import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Order } from './models/Order.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// OAuth2 Client
const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${BASE_URL}/auth/google/callback`
);

// ============ AUTH ROUTES ============

// Start OAuth flow
app.get('/auth/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile', // Added profile scope
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    });

    res.redirect(authUrl);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Find or create user
        let user = await User.findOne({ email: userInfo.data.email });
        if (!user) {
            user = new User({
                email: userInfo.data.email,
                name: userInfo.data.name,
                picture: userInfo.data.picture,
                googleId: userInfo.data.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            });
        } else {
            // Update tokens
            user.accessToken = tokens.access_token;
            if (tokens.refresh_token) {
                user.refreshToken = tokens.refresh_token;
            }
        }
        await user.save();

        console.log(`✅ User ${user.email} connected via MongoDB!`);

        // Redirect back with USER ID
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?gmail_connected=true&userId=${user._id}`);
    } catch (error) {
        console.error('OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?gmail_error=true`);
    }
});

// ============ API ROUTES ============

// Get all orders for a user
app.get('/api/orders', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    try {
        const orders = await Order.find({ user: userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create/Update orders (Sync)
app.get('/api/sync-orders', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Refresh credentials
        oauth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken
        });

        // Search for TikTok order emails
        const emails = await searchTikTokEmails(oauth2Client);

        if (emails.length === 0) {
            return res.json({ success: true, orders: [], message: 'No new emails found' });
        }

        // Get content & Parse
        const emailContents = await Promise.all(
            emails.slice(0, 20).map(email => getEmailContent(oauth2Client, email.id))
        );
        const parsedOrders = parseOrderEmails(emailContents);

        // Save to Database (Upsert)
        for (const orderData of parsedOrders) {
            // Create Order object with User reference
            await Order.findOneAndUpdate(
                { user: userId, orderId: orderData.orderId },
                { ...orderData, user: userId, source: 'gmail' },
                { upsert: true, new: true }
            );
        }

        // Return ALL orders (so frontend can update)
        const allOrders = await Order.find({ user: userId }).sort({ date: -1 });

        res.json({
            success: true,
            orders: allOrders, // Return full list
            message: `Synced ${parsedOrders.length} orders`,
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync orders', details: error.message });
    }
});

// Manual Order Entry
app.post('/api/orders', async (req, res) => {
    const { userId, ...orderData } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    try {
        const newOrder = new Order({ ...orderData, user: userId, source: 'manual', orderId: `MANUAL-${Date.now()}` });
        await newOrder.save();
        res.json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save order' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
💾 MongoDB Enabled
    `);
});
