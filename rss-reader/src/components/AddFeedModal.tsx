import { useState } from 'react';
import styles from './AddFeedModal.module.css';

interface AddFeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (url: string) => Promise<void>;
}

export default function AddFeedModal({ isOpen, onClose, onAdd }: AddFeedModalProps) {
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            await onAdd(url.trim());
            setUrl('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to add feed. Check the URL.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>Add New Feed</h2>
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="feed-url">RSS or Atom URL</label>
                        <input
                            id="feed-url"
                            type="url"
                            placeholder="https://example.com/feed.xml"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        {error && <p className={styles.error}>{error}</p>}
                    </div>

                    <div className={styles.helpText}>
                        <p>
                            <strong>Private Feeds:</strong> If subscribing to a paid newsletter like Substack or Patreon, use the private RSS link provided by the platform.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting || !url}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Feed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
