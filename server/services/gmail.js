import { google } from 'googleapis';

/**
 * Search for TikTok order confirmation emails
 * ONLY matches emails from TikTok Shop sender
 */
export async function searchTikTokEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    // STRICT: Only search for emails from TikTok Shop
    // TikTok Shop emails come from addresses like: noreply@tiktokshop.com or TikTok Shop <...>
    const searchQueries = [
        'from:"TikTok Shop"',
        'from:tiktokshop',
        'from:noreply@tiktok',
    ];

    const allEmails = [];
    const seenIds = new Set();

    for (const query of searchQueries) {
        try {
            const response = await gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: 50,
            });

            if (response.data.messages) {
                for (const msg of response.data.messages) {
                    if (!seenIds.has(msg.id)) {
                        seenIds.add(msg.id);
                        allEmails.push(msg);
                    }
                }
            }
        } catch (error) {
            console.error(`Search failed for query "${query}":`, error.message);
        }
    }

    console.log(`📧 Found ${allEmails.length} TikTok Shop emails`);
    return allEmails;
}

/**
 * Get full email content by ID
 */
export async function getEmailContent(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });

    try {
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
        });

        const message = response.data;
        const headers = message.payload.headers;

        // Extract important headers
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        // Get email body
        let body = '';
        if (message.payload.body?.data) {
            body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        } else if (message.payload.parts) {
            // Handle multipart emails
            for (const part of message.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    body += Buffer.from(part.body.data, 'base64').toString('utf-8');
                } else if (part.mimeType === 'text/html' && part.body?.data) {
                    body += Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            }
        }

        return {
            id: messageId,
            subject: getHeader('Subject'),
            from: getHeader('From'),
            date: getHeader('Date'),
            body,
            snippet: message.snippet,
        };
    } catch (error) {
        console.error(`Failed to get email ${messageId}:`, error.message);
        return null;
    }
}
