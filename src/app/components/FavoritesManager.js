'use client';

import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesManager() {
  const {
    lists,
    activeList,
    activeListId,
    setActiveListId,
    createList,
    deleteList,
    renameList,
    getShareUrl,
    hydrated,
  } = useFavorites();

  const [newListName, setNewListName] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  if (!hydrated) return null;
  if (lists.length === 0 && !showNewListInput) {
    return (
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={() => setShowNewListInput(true)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          + Create a saved list
        </button>
      </div>
    );
  }

  const handleShare = () => {
    const url = getShareUrl(activeListId);
    if (!url) return;
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    const name = newListName.trim() || 'My Favorites';
    createList(name);
    setNewListName('');
    setShowNewListInput(false);
  };

  const handleStartRename = (list) => {
    setRenamingId(list.id);
    setRenameValue(list.name);
  };

  const handleRename = (e, id) => {
    e.preventDefault();
    const name = renameValue.trim();
    if (name) renameList(id, name);
    setRenamingId(null);
  };

  const shareUrl = activeListId ? getShareUrl(activeListId) : null;

  return (
    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Saved
          {activeList && activeList.items.length > 0 && (
            <span className="ml-1 text-gray-400">({activeList.items.length})</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {shareUrl && (
            <button
              onClick={handleShare}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline"
            >
              {copied ? 'Copied!' : 'Share'}
            </button>
          )}
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline"
            >
              View
            </a>
          )}
        </div>
      </div>

      {/* List selector */}
      {lists.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {lists.map(list => (
            <div key={list.id} className="flex items-center gap-0.5">
              {renamingId === list.id ? (
                <form onSubmit={(e) => handleRename(e, list.id)} className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={(e) => handleRename(e, list.id)}
                    className="text-xs border border-gray-300 rounded px-1.5 py-0.5 w-28"
                  />
                </form>
              ) : (
                <button
                  onClick={() => setActiveListId(list.id)}
                  onDoubleClick={() => handleStartRename(list)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    list.id === activeListId
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {list.name}
                  {list.items.length > 0 && (
                    <span className={`ml-1 ${list.id === activeListId ? 'opacity-70' : 'opacity-40'}`}>
                      {list.items.length}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => deleteList(list.id)}
                className="text-gray-300 hover:text-gray-500 text-base leading-none ml-0.5"
                aria-label={`Delete ${list.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Single list name (when only one) */}
      {lists.length === 1 && (
        <div className="flex items-center gap-1">
          {renamingId === lists[0].id ? (
            <form onSubmit={(e) => handleRename(e, lists[0].id)} className="flex items-center gap-1">
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={(e) => handleRename(e, lists[0].id)}
                className="text-xs border border-gray-300 rounded px-1.5 py-0.5 w-28"
              />
            </form>
          ) : (
            <button
              onDoubleClick={() => handleStartRename(lists[0])}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Double-click to rename"
            >
              {lists[0].name}
            </button>
          )}
          <button
            onClick={() => deleteList(lists[0].id)}
            className="text-gray-300 hover:text-gray-500 text-base leading-none"
            aria-label={`Delete ${lists[0].name}`}
          >
            ×
          </button>
        </div>
      )}

      {/* New list input */}
      {showNewListInput ? (
        <form onSubmit={handleCreateList} className="flex items-center gap-1.5">
          <input
            autoFocus
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="List name"
            className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
            onBlur={() => {
              if (!newListName.trim()) setShowNewListInput(false);
            }}
          />
          <button type="submit" className="text-xs text-gray-600 hover:text-gray-900">
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowNewListInput(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
        >
          + New list
        </button>
      )}
    </div>
  );
}
