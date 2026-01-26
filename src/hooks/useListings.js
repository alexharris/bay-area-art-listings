import useSWR from 'swr';
import { useMemo } from 'react';
import getListings from '../app/components/getListings';
import getLocations from '../app/components/getLocations';

/**
 * Custom hook for fetching listings with SWR caching
 * - Returns cached data instantly on repeat visits
 * - Revalidates in background to keep data fresh
 * - Deduplicates simultaneous requests
 */
export function useListings() {
    const { data, error, isLoading, mutate } = useSWR(
        'listings',
        getListings,
        {
            revalidateOnFocus: false,      // Don't refetch when tab regains focus
            revalidateOnReconnect: true,   // Refetch when network reconnects
            dedupingInterval: 60000,       // Dedupe requests within 1 minute
            revalidateIfStale: true,       // Revalidate stale data in background
        }
    );

    // Memoize to prevent creating new array reference on every render
    const listings = useMemo(() => data || [], [data]);

    return {
        listings,
        isLoading,
        isError: error,
        refresh: mutate,  // Call this to manually refresh data
    };
}

/**
 * Custom hook for fetching locations with SWR caching
 */
export function useLocations() {
    const { data, error, isLoading, mutate } = useSWR(
        'locations',
        getLocations,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000,
            revalidateIfStale: true,
        }
    );

    // Memoize to prevent creating new array reference on every render
    const locations = useMemo(() => data || [], [data]);

    return {
        locations,
        isLoading,
        isError: error,
        refresh: mutate,
    };
}
