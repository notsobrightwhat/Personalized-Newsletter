import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Prepares this endpoint for Next.js cache / background refresh patterns
export const revalidate = 3600;

import { JSDOM } from 'jsdom';

// Helper to attempt auto-discovery of RSS feeds from HTML pages
async function discoverRssFeed(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        const contentType = res.headers.get('content-type') || '';

        // If it's already XML, no discovery needed
        if (contentType.includes('xml') || contentType.includes('rss') || contentType.includes('atom')) {
            return url;
        }

        const html = await res.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Look for <link rel="alternate" type="application/rss+xml" href="...">
        const selectors = [
            'link[type="application/rss+xml"]',
            'link[type="application/atom+xml"]',
            'link[type="application/json"]'
        ];

        for (const selector of selectors) {
            const link = doc.querySelector(selector);
            if (link) {
                let feedHref = link.getAttribute('href');
                if (feedHref) {
                    // Handle relative URLs
                    if (!feedHref.startsWith('http')) {
                        feedHref = new URL(feedHref, url).toString();
                    }
                    return feedHref;
                }
            }
        }
        return null;
    } catch (err) {
        console.error('Auto-discovery failed', err);
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const feedUrl = searchParams.get('url');

    if (!feedUrl) {
        return NextResponse.json(
            { error: 'Missing "url" query parameter' },
            { status: 400 }
        );
    }

    try {
        // 1. Auto-discover the real RSS feed if given a generic URL
        const discoveredUrl = await discoverRssFeed(feedUrl);
        const finalUrl = discoveredUrl || feedUrl;

        const parser = new Parser({
            customFields: {
                item: ['content:encoded', 'content'],
            }
        });

        const feed = await parser.parseURL(finalUrl);

        return NextResponse.json({
            feed,
            _discoveredUrl: discoveredUrl && discoveredUrl !== feedUrl ? discoveredUrl : undefined
        });
    } catch (error: any) {
        console.error(`Error fetching feed ${feedUrl}:`, error.message);

        let userMsg = error.message;
        if (userMsg.includes('Non-whitespace before first tag')) {
            userMsg = 'This URL points to a website, but no valid RSS feed could be found at that address.';
        }

        return NextResponse.json(
            { error: `Failed to parse feed: ${userMsg}` },
            { status: 500 }
        );
    }
}
