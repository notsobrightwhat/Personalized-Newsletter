import { useState, useEffect, useCallback } from 'react';
import { feedStorage, FeedSubscription } from '@/lib/storage';

export interface FeedItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    content?: string;
    sourceTitle: string;
    sourceUrl: string;
}

export function useFeeds() {
    const [subscriptions, setSubscriptions] = useState<FeedSubscription[]>([]);
    const [articles, setArticles] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [hasLoadedDefaults, setHasLoadedDefaults] = useState(false);

    const loadSubscriptions = useCallback(async () => {
        try {
            const feeds = await feedStorage.getFeeds();
            setSubscriptions(feeds);

            // If feeds were just seeded from defaults, we should force a refresh
            // if we don't already have articles and haven't tried yet
            if (feeds.length > 0 && !hasLoadedDefaults) {
                setHasLoadedDefaults(true);
            }
        } catch (err) {
            console.error('Failed to load subscriptions', err);
        }
    }, [hasLoadedDefaults]);

    useEffect(() => {
        loadSubscriptions();
    }, [loadSubscriptions]);

    const addSubscription = async (url: string, name?: string) => {
        try {
            await feedStorage.addFeed({ url, name });
            await loadSubscriptions();
        } catch (err: any) {
            throw new Error(err.message || 'Failed to add feed');
        }
    };

    const removeSubscription = async (id: string) => {
        try {
            await feedStorage.removeFeed(id);
            await loadSubscriptions();
        } catch (err) {
            console.error('Failed to remove feed', err);
        }
    };

    const refreshArticles = useCallback(async () => {
        if (subscriptions.length === 0) {
            setArticles([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const fetchPromises = subscriptions.map(async (sub) => {
                try {
                    const res = await fetch(`/api/feed?url=${encodeURIComponent(sub.url)}`);
                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    const data = await res.json();

                    if (!data.feed || !data.feed.items) return [];

                    return data.feed.items.map((item: any) => ({
                        id: item.guid || item.id || item.link,
                        title: item.title || 'Untitled',
                        link: item.link || sub.url,
                        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                        contentSnippet: item.contentSnippet || item.snippet,
                        content: item['content:encoded'] || item.content,
                        sourceTitle: data.feed.title || sub.name || 'Unknown Source',
                        sourceUrl: sub.url
                    })) as FeedItem[];
                } catch (e) {
                    console.error(`Failed to fetch ${sub.url}`, e);
                    return [];
                }
            });

            const results = await Promise.all(fetchPromises);
            const allArticles = results.flat();

            // Aggregate and sort by newest first
            allArticles.sort((a, b) => {
                return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
            });

            setArticles(allArticles);
        } catch (err: any) {
            setError(err.message || 'Failed to refresh articles');
        } finally {
            setIsLoading(false);
        }
    }, [subscriptions]);

    useEffect(() => {
        refreshArticles();
    }, [refreshArticles, hasLoadedDefaults]);

    return {
        subscriptions,
        articles,
        isLoading,
        error,
        addSubscription,
        removeSubscription,
        refreshArticles
    };
}
