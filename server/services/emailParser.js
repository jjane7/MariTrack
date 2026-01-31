/**
 * TikTok Shop Email Parser v3
 * 
 * SIMPLIFIED APPROACH:
 * - Uses email SUBJECT LINE for product title (cleanest source)
 * - Extracts Order ID from body (18-20 digit numbers)
 * - Very strict patterns for shop name and variant
 */

/**
 * Parse TikTok order emails
 */
export function parseOrderEmails(emails, options = {}) {
    const orders = [];

    for (const email of emails) {
        if (!email) continue;

        try {
            const order = extractOrderFromEmail(email);
            if (order) {
                orders.push(order);
                console.log(`✅ Parsed: ${order.itemName.substring(0, 40)}...`);
            }
        } catch (error) {
            console.error(`Failed to parse email ${email.id}:`, error.message);
        }
    }

    // Remove duplicates
    const uniqueOrders = [];
    const seen = new Set();

    for (const order of orders) {
        const key = order.orderId || order.emailId;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueOrders.push(order);
        }
    }

    return uniqueOrders;
}

/**
 * Extract order from email
 */
function extractOrderFromEmail(email) {
    const { subject, body, snippet, date, from } = email;

    // Validate it's from TikTok
    if (!isTikTokEmail(from || '', subject || '')) {
        return null;
    }

    // Get the cleanest text for extraction
    const cleanSnippet = cleanText(snippet || '');
    const cleanBody = cleanText(body || '');
    const allText = cleanSnippet + ' ' + cleanBody;

    // Extract Order ID first (this is reliable)
    const orderId = extractOrderId(allText);

    // Status from subject
    const status = getStatus(subject || '');

    // Extract other fields
    const shopName = extractShopName(allText);
    const variant = extractVariant(allText);
    const trackingNumber = extractTracking(allText);
    const totalPrice = extractTotalPrice(allText);
    const quantity = extractQuantity(allText);

    // Create a meaningful title using Order ID
    let itemName;
    if (orderId) {
        // Short order ID for display (last 8 digits)
        const shortId = orderId.slice(-8);
        itemName = `TikTok Order #${shortId}`;
    } else {
        // Fallback based on status
        switch (status) {
            case 'Arrived': itemName = 'Delivered Order'; break;
            case 'Shipped': itemName = 'Shipped Order'; break;
            default: itemName = 'New TikTok Order';
        }
    }

    return {
        id: generateId(),
        source: 'gmail',
        emailId: email.id,
        itemName: itemName,
        shopName: shopName,
        variant: variant,
        quantity: quantity,
        price: totalPrice,
        category: 'Fashion',
        purchaseDate: parseDate(date),
        status: status,
        trackingNumber: trackingNumber,
        orderId: orderId,
        carrier: trackingNumber ? (trackingNumber.startsWith('JT') ? 'J&T Express' : 'Standard') : 'Standard',
        importedAt: new Date().toISOString(),
    };
}

/**
 * Check if from TikTok
 */
function isTikTokEmail(from, subject) {
    const lower = (from + ' ' + subject).toLowerCase();
    return lower.includes('tiktok');
}

/**
 * Get status from subject
 */
function getStatus(subject) {
    const s = subject.toLowerCase();
    if (s.includes('delivered') || s.includes('received')) return 'Arrived';
    if (s.includes('out for delivery')) return 'Out for Delivery';
    if (s.includes('shipped') || s.includes('on the way')) return 'Shipped';
    return 'Ordered';
}

/**
 * Extract product name from SUBJECT LINE
 * TikTok subjects are like: "Your order is confirmed!" or "Your order has shipped!"
 * The snippet often continues with the product info
 */
function extractProductFromSubject(subject, status) {
    // Clean the subject
    let clean = subject
        .replace(/^(Fwd|Re|Fw):\s*/gi, '')
        .replace(/Your order (is confirmed|has been confirmed|has shipped|has been delivered|is on the way)!?/gi, '')
        .replace(/TikTok\s*(Shop)?:?\s*/gi, '')
        .replace(/Order\s*(confirmed|shipped|delivered)?:?\s*/gi, '')
        .replace(/Thanks for (your )?(order|shopping)!?/gi, '')
        .replace(/Track your (order|package)/gi, '')
        .replace(/Delivery (info|update|notification)/gi, '')
        .trim();

    // If there's still good content, use it
    if (clean.length > 5 && !clean.match(/^\d+$/) && !clean.toLowerCase().includes('shipping')) {
        return capitalizeWords(clean.substring(0, 80));
    }

    // Fallback based on status
    switch (status) {
        case 'Arrived': return 'Delivered Order';
        case 'Shipped': return 'Shipped Order';
        case 'Out for Delivery': return 'Order Out for Delivery';
        default: return 'New TikTok Order';
    }
}

/**
 * Clean text - remove HTML, CSS, special patterns
 */
function cleanText(text) {
    if (!text) return '';
    return text
        // Remove HTML tags
        .replace(/<[^>]+>/g, ' ')
        // Remove CSS
        .replace(/[a-z-]+:\s*[^;}<]+[;}]/gi, ' ')
        .replace(/rgba?\([^)]+\)/gi, ' ')
        .replace(/#[a-f0-9]{3,8}/gi, ' ')
        .replace(/\d+(?:px|em|rem|%)/gi, ' ')
        .replace(/(?:nowrap|solid|dotted|dashed|block|inline|flex)/gi, ' ')
        // Remove entities
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/&#\d+;/gi, ' ')
        // Collapse spaces
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract 18-20 digit Order ID
 */
function extractOrderId(text) {
    const match = text.match(/(\d{18,20})/);
    return match ? match[1] : '';
}

/**
 * Extract tracking number (J&T, SPX formats)
 */
function extractTracking(text) {
    // J&T format
    const jt = text.match(/(JT\d{13,16})/i);
    if (jt) return jt[1].toUpperCase();

    // SPX format
    const sp = text.match(/(SP\d{12,})/i);
    if (sp) return sp[1].toUpperCase();

    return '';
}

/**
 * Extract shop name - VERY STRICT patterns only
 */
function extractShopName(text) {
    // Only match very specific patterns
    const patterns = [
        // "X Official Store"
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+Official\s+Store/i,
        // "X Online Shop" (not "TikTok Shop")
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+Online\s+Shop/i,
    ];

    for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1]) {
            const name = m[1].trim();
            // Validate
            if (name.length >= 3 &&
                name.length <= 30 &&
                !name.toLowerCase().includes('tiktok') &&
                !name.toLowerCase().includes('order') &&
                !name.toLowerCase().includes('delivery')) {
                return capitalizeWords(name);
            }
        }
    }

    return '';
}

/**
 * Extract variant - VERY STRICT (color + size only)
 */
function extractVariant(text) {
    // Must have color word followed by optional code/size
    const colorPattern = /(black|white|red|blue|pink|brown|green|gray|beige|navy|purple|yellow|orange)\s*([#A-Z0-9-]{0,15})?\s*(?:,?\s*(?:EU|US|UK)[:\s]?(\d{1,3}))?/i;

    const m = text.match(colorPattern);
    if (m) {
        let variant = m[1];
        if (m[2]) variant += ' ' + m[2];
        if (m[3]) variant += ', EU:' + m[3];

        // Validate - must not contain garbage
        if (variant.length >= 3 &&
            variant.length <= 40 &&
            !variant.match(/msg|email|for\s|your|order/i)) {
            return variant.trim();
        }
    }

    return '';
}

/**
 * Extract total price (looks for "Total" label or distinct pattern)
 */
function extractTotalPrice(text) {
    // Common labels in TikTok emails
    const labels = [
        'Total Payment',
        'Order Total',
        'Grand Total',
        'Total Amount',
        'Total \\(\\d+ items?\\)', // Total (1 item)
        'Total'
    ];

    for (const label of labels) {
        // strict pattern: Label followed by optional colon/whitespace, then currency/price
        // Handles: "Total (1 item) ₱217.43"
        const pattern = new RegExp(`(${label})[:\\s]*[₱P]?\\s*([\\d,]+\\.?\\d*)`, 'i');
        const match = text.match(pattern);

        if (match && match[2]) {
            const price = parseFloat(match[2].replace(/,/g, ''));
            if (price > 0 && price < 100000) return price;
        }
    }

    // Fallback: look for the LAST price in the email (usually the total)
    // Get all prices
    const allPrices = text.matchAll(/₱\s*([\d,]+\.?\d*)/g);
    let lastPrice = 0;
    for (const m of allPrices) {
        if (m && m[1]) {
            const p = parseFloat(m[1].replace(/,/g, ''));
            if (p > 0) lastPrice = p;
        }
    }

    if (lastPrice > 0) return lastPrice;

    return 0;
}

/**
 * Extract price
 */
function extractPrice(text) {
    const m = text.match(/₱\s*([\d,]+\.?\d*)/);
    if (m) {
        const price = parseFloat(m[1].replace(/,/g, ''));
        if (price > 0 && price < 100000) return price;
    }
    return 0;
}

/**
 * Extract quantity
 */
function extractQuantity(text) {
    const m = text.match(/[×x](\d+)/i) || text.match(/(\d+)\s*items?/i);
    if (m) {
        const q = parseInt(m[1]);
        if (q > 0 && q < 100) return q;
    }
    return 1;
}

/**
 * Parse date
 */
function parseDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch (e) { }
    return new Date().toISOString().split('T')[0];
}

/**
 * Generate ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Capitalize words
 */
function capitalizeWords(str) {
    return str.split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}
