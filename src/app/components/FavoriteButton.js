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
      aria-label={saved ? 'Remove from saved' : 'Save exhibition'}
      className={`pt-0 pb-1 px-1 -ml-1 -mt-2 ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
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
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}
