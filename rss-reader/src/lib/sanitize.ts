import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // DOMPurify needs a real DOM window. 
        // On the server/in SSR, we just return the string or a stripped version,
        // since we only safely render on the client anyway for this specific app structure.
        return html;
    }

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
}
