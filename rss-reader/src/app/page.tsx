"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useFeeds, FeedItem } from "@/hooks/useFeeds";
import AddFeedModal from "@/components/AddFeedModal";
import StoryCard from "@/components/StoryCard";
import ReadingView from "@/components/ReadingView";

export default function Home() {
  const { subscriptions, articles, isLoading, error, addSubscription, removeSubscription, refreshArticles } = useFeeds();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);

  return (
    <div className={styles.layout}>
      {/* Sidebar: Feeds Management */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Subscriptions</h1>
          <button
            className={styles.addBtn}
            onClick={() => setIsModalOpen(true)}
            aria-label="Add new feed"
          >
            + Add
          </button>
        </div>

        <nav className={styles.feedNav}>
          {subscriptions.length === 0 ? (
            <p className={styles.emptyFeedsText}>No subscriptions yet.</p>
          ) : (
            <ul className={styles.feedList}>
              {subscriptions.map(sub => (
                <li key={sub.id} className={styles.feedListItem}>
                  <div className={styles.feedInfo}>
                    <span className={styles.feedName}>{sub.name || new URL(sub.url).hostname.replace('www.', '')}</span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeSubscription(sub.id)}
                    aria-label={`Remove ${sub.url}`}
                    title="Remove feed"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>

      {/* Main Content: Aggregated Articles */}
      <main className={styles.main}>
        <div className={styles.content}>
          <header className={styles.feedHeader}>
            <h2 className={styles.feedTitle}>All Articles</h2>

            <button
              className={styles.refreshBtn}
              onClick={refreshArticles}
              disabled={isLoading}
            >
              {isLoading ? 'Rerfreshing...' : '↻ Refresh'}
            </button>
          </header>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.articleList}>
            {isLoading && articles.length === 0 ? (
              <p className={styles.statusText}>Loading articles...</p>
            ) : articles.length === 0 ? (
              <p className={styles.emptyStateText}>
                No articles found. Add some active RSS feeds to get started.
              </p>
            ) : (
              articles.map(article => (
                <StoryCard
                  key={article.id}
                  item={article}
                  onClick={setSelectedArticle}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AddFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addSubscription}
      />

      {selectedArticle && (
        <ReadingView
          item={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
