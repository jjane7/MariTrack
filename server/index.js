import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { parseOrderEmails } from './services/emailParser.js';
import { searchTikTokEmails, getEmailContent } from './services/gmail.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// In-memory token storage (in production, use a database)
let userTokens = null;

// ============ AUTH ROUTES ============

// Start OAuth flow
app.get('/auth/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
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
        userTokens = tokens;

        console.log('✅ Gmail connected successfully!');

        // Redirect back to frontend with success
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?gmail_connected=true`);
    } catch (error) {
        console.error('OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?gmail_error=true`);
    }
});

// Check connection status
app.get('/auth/status', (req, res) => {
    res.json({
        connected: !!userTokens,
        hasRefreshToken: !!(userTokens?.refresh_token),
    });
});

// Disconnect Gmail
app.post('/auth/disconnect', (req, res) => {
    userTokens = null;
    res.json({ success: true, message: 'Gmail disconnected' });
});

// ============ SYNC ROUTES ============

// Sync orders from Gmail
app.get('/api/sync-orders', async (req, res) => {
    if (!userTokens) {
        return res.status(401).json({ error: 'Gmail not connected' });
    }

    try {
        // Refresh credentials if needed
        oauth2Client.setCredentials(userTokens);

        // Search for TikTok order emails
        const emails = await searchTikTokEmails(oauth2Client);

        if (emails.length === 0) {
            return res.json({
                success: true,
                orders: [],
                message: 'No TikTok order emails found'
            });
        }

        // Get full content for each email
        const emailContents = await Promise.all(
            emails.slice(0, 20).map(email => getEmailContent(oauth2Client, email.id))
        );

        // Parse orders from emails
        const orders = parseOrderEmails(emailContents);

        res.json({
            success: true,
            orders,
            emailsProcessed: emailContents.length,
            message: `Found ${orders.length} orders from ${emailContents.length} emails`,
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync orders', details: error.message });
    }
});

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        gmailConnected: !!userTokens,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 TikTok Orders Server running on port ${PORT}
📧 Gmail OAuth: http://localhost:${PORT}/auth/google
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
  `);
});
