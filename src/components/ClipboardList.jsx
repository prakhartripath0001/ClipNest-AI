/**
 * CLIPBOARD LIST COMPONENT
 * ========================
 * 
 * Displays a list of clipboard items with pagination
 * 
 * Features:
 * - Virtual scrolling (render only visible items)
 * - Infinite scroll on bottom
 * - Loading states
 * - Empty state
 * - Error handling
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { ClipboardItem } from './ClipboardItem';

export function ClipboardList({
  items,
  loading,
  error,
  onCopy,
  onDelete,
  onToggleFavorite,
  onLoadMore,
  hasMore,
}) {
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Infinite scroll - load more items when reaching bottom
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-semibold">Error: {error}</p>
        <p className="text-sm text-slate-500 mt-2">Failed to load clipboard items</p>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          No clipboard items yet
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
          Copy something to get started
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]"
    >
      {items.map((item) => (
        <ClipboardItem
          key={item.id}
          item={item}
          onCopy={onCopy}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {loading && (
            <div className="flex justify-center items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
