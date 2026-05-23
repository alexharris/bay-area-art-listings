'use client';

import Listings from './listing';
import { FavoritesProvider } from '@/context/FavoritesContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}

export default function SharedListView({ listings }) {
  return (
    <FavoritesProvider>
      <Listings
        listings={listings}
        formatDate={formatDate}
        onViewToday={false}
        setOnViewToday={() => {}}
        endingSoonOnly={false}
        setEndingSoonOnly={() => {}}
        openingTodayOnly={false}
        setOpeningTodayOnly={() => {}}
      />
    </FavoritesProvider>
  );
}
