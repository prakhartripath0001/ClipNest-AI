/**
 * CLIPBOARD ITEM COMPONENT
 * ========================
 * 
 * Displays a single clipboard item with:
 * - Content preview
 * - Type badge (text/code/image/url)
 * - Copy and delete buttons
 * - Favorite toggle
 * - Timestamp
 * 
 * Props:
 * - item: Clipboard item object
 * - onCopy: Callback when copy is clicked
 * - onDelete: Callback when delete is clicked
 * - onToggleFavorite: Callback for favorite toggle
 */

import React, { useState } from 'react';

// Type badge colors and icons
const TYPE_CONFIG = {
  text: {
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    icon: '📝',
    label: 'Text',
  },
  code: {
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    icon: '💻',
    label: 'Code',
  },
  image: {
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    icon: '🖼️',
    label: 'Image',
  },
  url: {
    color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    icon: '🔗',
    label: 'URL',
  },
};

export function ClipboardItem({
  item,
  onCopy,
  onDelete,
  onToggleFavorite,
}) {
  const [copying, setCopying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.text;

  // Format timestamp
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    // Less than a minute
    if (diff < 60000) return 'Just now';

    // Less than an hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Format as date
    return date.toLocaleDateString();
  };

  // Get preview text
  const getPreview = () => {
    if (item.type === 'image') {
      return item.preview || 'Image pasted';
    }
    return item.preview || item.content || 'Empty clipboard item';
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      await onCopy(item.id);
    } finally {
      setCopying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-3 hover:shadow-lg transition-all animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.icon} {typeConfig.label}
          </span>

          {/* Favorite star */}
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
          >
            {item.is_favorite ? '⭐' : '☆'}
          </button>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatTime(item.created_at)}
        </span>
      </div>

      {/* Content preview */}
      <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700 rounded text-sm font-mono text-truncate-lines-3">
        {getPreview()}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={copying}
          className="flex-1 btn btn-primary disabled:opacity-50"
        >
          {copying ? 'Copying...' : 'Copy'}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 btn btn-secondary disabled:opacity-50"
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>

      {/* Metadata */}
      {item.access_count > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Accessed {item.access_count}x
        </div>
      )}
    </div>
  );
}
