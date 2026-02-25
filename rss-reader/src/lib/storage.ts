export interface FeedSubscription {
    id: string;
    url: string;
    name?: string;
    addedAt: number;
}

export interface StorageProtocol {
    getFeeds(): Promise<FeedSubscription[]>;
    addFeed(feed: Omit<FeedSubscription, 'id' | 'addedAt'>): Promise<FeedSubscription>;
    removeFeed(id: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageProtocol {
    private key = 'rss_subscriptions';

    async getFeeds(): Promise<FeedSubscription[]> {
        if (typeof window === 'undefined') return [];

        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    async addFeed(feed: Omit<FeedSubscription, 'id' | 'addedAt'>): Promise<FeedSubscription> {
        const feeds = await this.getFeeds();
        const newFeed: FeedSubscription = {
            ...feed,
            id: feed.url, // Using URL as a unique ID for simplicity
            addedAt: Date.now(),
        };

        if (feeds.some(f => f.id === newFeed.id)) {
            throw new Error('Feed already exists');
        }

        const newFeeds = [...feeds, newFeed];
        localStorage.setItem(this.key, JSON.stringify(newFeeds));
        return newFeed;
    }

    async removeFeed(id: string): Promise<void> {
        const feeds = await this.getFeeds();
        const newFeeds = feeds.filter(f => f.id !== id);
        localStorage.setItem(this.key, JSON.stringify(newFeeds));
    }
}

// The app will use this instance, allowing us to easily swap out the adapter later
export const feedStorage = new LocalStorageAdapter();
