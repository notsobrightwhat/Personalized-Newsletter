import { FeedItem } from '@/hooks/useFeeds';
import { sanitizeHtml } from '@/lib/sanitize';
import styles from './ReadingView.module.css';

interface ReadingViewProps {
    item: FeedItem;
    onClose: () => void;
}

export default function ReadingView({ item, onClose }: ReadingViewProps) {
    const date = new Date(item.pubDate).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Most RSS feeds put full content in `content:encoded` which maps to `item.content` here
    // Fallback to snippet if full content isn't available
    const htmlContent = item.content || item.contentSnippet || '';

    return (
        <div className={styles.overlay}>
            <article className={styles.reader}>
                <header className={styles.header}>
                    <button onClick={onClose} className={styles.backBtn} aria-label="Close reading view">
                        ← Back
                    </button>

                    <div className={styles.meta}>
                        <span className={styles.source}>{item.sourceTitle}</span>
                        <span className={styles.date}>{date}</span>
                    </div>

                    <h1 className={styles.title}>{item.title}</h1>

                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.originalLink}
                    >
                        Read original article ↗
                    </a>
                </header>

                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
                />
            </article>
        </div>
    );
}
