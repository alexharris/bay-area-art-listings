'use client';

import { useFavorites } from '@/hooks/useFavorites';

export default function FavoriteButton({ listingId }) {
  const { isFavorite, toggleFavorite, hydrated } = useFavorites();

  if (!hydrated) return null;

  const saved = isFavorite(listingId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(listingId);
      }}
      aria-label={saved ? 'Remove from saved' : 'Save exhibition'}
      className={`absolute top-4 right-0 p-1.5 transition-colors ${saved ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
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
