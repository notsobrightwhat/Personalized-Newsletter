import { FeedItem } from '@/hooks/useFeeds';
import { sanitizeHtml } from '@/lib/sanitize';
import styles from './StoryCard.module.css';

export default function StoryCard({
    item,
    onClick
}: {
    item: FeedItem;
    onClick: (item: FeedItem) => void;
}) {
    const date = new Date(item.pubDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <article
            className={styles.card}
            onClick={() => onClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick(item);
                }
            }}
        >
            <div className={styles.meta}>
                <span className={styles.source}>{item.sourceTitle}</span>
                <span className={styles.date}>{date}</span>
            </div>
            <h3 className={styles.title}>{item.title}</h3>
            {item.contentSnippet && (
                <p
                    className={styles.snippet}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.contentSnippet) }}
                />
            )}
        </article>
    );
}
