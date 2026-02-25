import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Prepares this endpoint for Next.js cache / background refresh patterns
export const revalidate = 3600;

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
        const parser = new Parser({
            customFields: {
                item: ['content:encoded', 'content'],
            }
        });

        // Note for authenticated feeds:
        // If a feed requires HTTP Basic Auth, the user can pass it within the URL directly
        // (e.g. https://username:password@example.com/rss). 
        // Token-based feeds often embed the token in the URL itself.
        const feed = await parser.parseURL(feedUrl);

        return NextResponse.json({ feed });
    } catch (error: any) {
        console.error(`Error fetching feed ${feedUrl}:`, error.message);
        return NextResponse.json(
            { error: `Failed to parse feed: ${error.message}` },
            { status: 500 }
        );
    }
}
