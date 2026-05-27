'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { useState, useEffect, startTransition } from 'react';

export default function FavoriteButton({ listingId }) {
  const { isFavorite, toggleFavorite, hydrated } = useFavorites();
  const [localSaved, setLocalSaved] = useState(null);

  const contextSaved = hydrated ? isFavorite(listingId) : false;

  // Once context catches up, clear the optimistic override
  useEffect(() => {
    setLocalSaved(null);
  }, [contextSaved]);

  if (!hydrated) return null;

  const saved = localSaved !== null ? localSaved : contextSaved;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setLocalSaved(!saved);
        startTransition(() => toggleFavorite(listingId));
      }}
      aria-label={saved ? 'Remove from starred' : 'Star exhibition'}
      className={`pt-0 pb-1 px-1 -ml-1 -mt-2 ${saved ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </button>
  );
}
