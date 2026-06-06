'use client'

import { haversineDistance } from '../../../utils/distance';

function toDateStr(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function formatDayHeader(dateStr) {
    // dateStr is YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function EventsView({ listings, calendarDateRangeFilter, selectedCounty, userLocation, nearbyRadius = 10, openingsOnly = false }) {
    const today = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    );
    const todayStr = today.toISOString().split('T')[0];

    const fromStr = calendarDateRangeFilter?.from ? toDateStr(calendarDateRangeFilter.from) : null;
    const toStr = calendarDateRangeFilter?.to ? toDateStr(calendarDateRangeFilter.to) : null;

    const events = (listings || [])
        .filter(listing => {
            if (selectedCounty?.length > 0 && !selectedCounty.includes(listing.locationCounty)) return false;
            if (userLocation && listing.locationGeolocation) {
                const dist = haversineDistance(
                    userLocation.lat, userLocation.lng,
                    listing.locationGeolocation.lat, listing.locationGeolocation.lng
                );
                if (dist > nearbyRadius) return false;
            }
            return true;
        })
        .flatMap(listing =>
            (listing.openings || [])
                .filter(o => {
                    if (!o.date) return false;
                    if (o.date < todayStr) return false;
                    if (fromStr && o.date < fromStr) return false;
                    if (toStr && o.date > toStr) return false;
                    if (openingsOnly && !o.title?.toLowerCase().includes('opening reception')) return false;
                    return true;
                })
                .map(opening => ({ ...opening, listing }))
        )
        .sort((a, b) => a.date.localeCompare(b.date));

    // Group by date
    const grouped = events.reduce((acc, event) => {
        if (!acc[event.date]) acc[event.date] = [];
        acc[event.date].push(event);
        return acc;
    }, {});

    const dates = Object.keys(grouped);

    if (dates.length === 0) {
        return (
            <div className="text-center flex-grow flex flex-col justify-center text-2xl py-36">
                <p className="pb-4">No Events</p>
                <p className="pb-4">¯\_(ツ)_/¯</p>
                <p>Try changing your filters.</p>
            </div>
        );
    }

    return (
        <div className="pt-4 pb-16 space-y-6">
            {dates.map(date => (
                <div key={date}>
                    <h2 className="sticky top-[140px] lg:top-10 bg-white z-10 text-xs font-bold uppercase tracking-wider text-gray-900 pt-3 pb-2 border-y border-gray-200 mb-0 px-3">
                        {formatDayHeader(date)}
                    </h2>
                    <div className="divide-y divide-gray-200">
                        {grouped[date].map((event, i) => (
                            <div key={i} className="py-3 px-3">
                                {event.listing.locationUrl
                                    ? <a href={event.listing.locationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 truncate block mb-0.5 hover:underline">{event.listing.locationName}</a>
                                    : <p className="text-sm text-gray-400 truncate mb-0.5">{event.listing.locationName}</p>
                                }
                                <p className="text-base text-gray-700 font-medium">{event.title}</p>
                                {event.time && <p className="text-sm text-gray-700">{event.time}</p>}
                                {event.listing.EventUrl
                                    ? <a href={event.listing.EventUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 truncate block hover:underline">Part of: {event.listing.Event}</a>
                                    : <p className="text-sm text-gray-700 truncate">Part of: {event.listing.Event}</p>
                                }
                                {event.note && <p className="text-sm text-gray-700">{event.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
