'use client'

import { haversineDistance } from '../../../utils/distance';
import { generateSlug, cityFromAddress } from '../../../utils/shared';
import { linkifyText } from '../../../utils/linkifyText';

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

export default function EventsView({ events: allEvents = [], calendarDateRangeFilter, selectedCounty, userLocation, nearbyRadius = 10, openingsOnly = false, searchTerm = '', onShowSelect }) {
    const today = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    );
    const todayStr = today.toISOString().split('T')[0];

    const fromStr = calendarDateRangeFilter?.from ? toDateStr(calendarDateRangeFilter.from) : null;
    const toStr = calendarDateRangeFilter?.to ? toDateStr(calendarDateRangeFilter.to) : null;
    const term = searchTerm.trim().toLowerCase();

    const events = (allEvents || [])
        .filter(event => {
            if (!event.date || event.date < todayStr) return false;
            if (fromStr && event.date < fromStr) return false;
            if (toStr && event.date > toStr) return false;
            if (openingsOnly && !event.title?.toLowerCase().includes('opening')) return false;
            if (selectedCounty?.length > 0 && !selectedCounty.includes(event.locationCounty)) return false;
            if (userLocation && event.locationGeolocation) {
                const dist = haversineDistance(
                    userLocation.lat, userLocation.lng,
                    event.locationGeolocation.lat, event.locationGeolocation.lng
                );
                if (dist > nearbyRadius) return false;
            }
            if (!term) return true;
            return [event.title, event.note, event.locationName, event.locationAddress, event.locationUrl, event.relatedShow]
                .some(v => v && v.toLowerCase().includes(term));
        })
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
        <div className="pb-16 space-y-6">
            {dates.map(date => (
                <div key={date}>
                    <h2 className="sticky top-[140px] lg:top-10 bg-gray-50 z-10 text-xs font-bold uppercase tracking-wider text-gray-900 pt-3 pb-2 border-y border-gray-200 mb-0 px-3">
                        {formatDayHeader(date)}
                    </h2>
                    <div className="divide-y divide-gray-200">
                        {grouped[date].map(event => (
                            <div key={event._id} className="py-3 px-3">
                                {(() => {
                                    const city = event.locationCity || cityFromAddress(event.locationAddress);
                                    const label = city ? `${event.locationName} · ${city}` : event.locationName;
                                    return event.locationUrl
                                        ? <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 truncate block mb-0.5 hover:underline">{label}</a>
                                        : <p className="text-sm text-gray-400 truncate mb-0.5">{label}</p>;
                                })()}
                                <p className="text-base text-gray-700 font-medium">
                                    {event.url
                                        ? <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{event.title}</a>
                                        : event.title}
                                </p>
                                {event.time && <p className="text-sm text-gray-700">{event.time}</p>}
                                {event.relatedShow && (
                                    <button onClick={() => onShowSelect?.(generateSlug(event.relatedShow))} className="text-sm text-gray-700 truncate block hover:underline text-left w-full">Part of: {event.relatedShow}</button>
                                )}
                                {event.note && <p className="text-sm text-gray-700">{linkifyText(event.note)}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
