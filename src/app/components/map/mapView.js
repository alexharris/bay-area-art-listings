'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { extractPortableTextContent } from '../../../utils/helpers';
import TodaysHoursStatus from '../TodaysHoursStatus';
import HoursPopup from '../HoursPopup';
import { formatDate } from '../../../utils/shared';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import Image from 'next/image';
import CalendarLink from '../CalendarLink';
import NotesRenderer from '../NotesRenderer';
import DateNote from '../DateNote';
import { Badge } from '@/components/ui/badge';

// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// MapController fits the map to visible marker positions when a county is selected or flies to user location
const MapController = dynamic(
    () => Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
        const useMap = rl.useMap;
        function Controller({ selectedCounty, markerPositions, userLocation }) {
            const map = useMap();
            useEffect(() => {
                if (userLocation) {
                    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });
                    return;
                }
                const hasCounty = selectedCounty?.length > 0;
                if (!hasCounty) {
                    map.flyTo([37.7749, -122.4194], 10, { duration: 0.8 });
                    return;
                }
                if (markerPositions.length === 0) return;
                if (markerPositions.length === 1) {
                    map.flyTo(markerPositions[0], 14, { duration: 0.8 });
                    return;
                }
                const bounds = L.latLngBounds(markerPositions);
                map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 14, duration: 1.2 });
            }, [selectedCounty?.length, markerPositions.length, userLocation?.lat, userLocation?.lng]);
            return null;
        }
        return Controller;
    }),
    { ssr: false }
);

// Render sub-events (openings) matching the list view style
function renderOpenings(item) {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const upcoming = item.openings
        ?.filter(o => o.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)) || [];
    if (!upcoming.length) return null;
    return (
        <div className="flex flex-col gap-1 mt-1">
            {upcoming.map((opening, idx) => {
                const isToday = opening.date === today;
                return (
                    <div key={opening._key || idx} className="text-sm border-b border-dashed border-gray-100 pb-1.5 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${isToday ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                <span className="font-medium">{opening.title}</span>
                            </div>
                            <div className="text-gray-700">
                                <CalendarLink
                                    dateLabel={`${new Date(opening.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}${opening.time ? ` ${opening.time}` : ''}`}
                                    singleEvent={{
                                        title: opening.title,
                                        date: opening.date,
                                        time: opening.time,
                                        locationName: item.locationName,
                                    }}
                                />
                            </div>
                        </div>
                        {opening.note && <div className="text-gray-600">{opening.note}</div>}
                    </div>
                );
            })}
        </div>
    );
}

// ShowCard mirrors the mobile list view layout
function ShowCard({ item, formatDate }) {
    return (
        <div className="border-b border-dashed border-gray-300 py-4 last:border-0 flex flex-col gap-2">
            {/* Image */}
            {item.eventImageUrl && (
                <div className="w-full bg-gray-100 rounded overflow-hidden mb-1">
                    <div className="relative w-full aspect-[4/3]">
                        {item.eventImageUrl.includes('cdn.sanity.io') ? (
                            <Image
                                src={item.eventImageUrl}
                                alt={item.eventImageCaption || item.Event}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        ) : (
                            <img
                                src={item.eventImageUrl}
                                alt={item.eventImageCaption || item.Event}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    {item.eventImageCaption && (
                        <p className="text-xs text-gray-400 px-2.5 py-2 leading-snug">{item.eventImageCaption}</p>
                    )}
                </div>
            )}

            {/* Title */}
            <div className="mb-1">
                {item.EventUrl ? (
                    <a href={item.EventUrl} target="_blank" rel="noopener noreferrer" className="text-2xl">
                        <h3>{item.Event}<svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1 w-4 h-4 align-baseline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></h3>
                    </a>
                ) : (
                    <span className="text-2xl"><h3>{item.Event}</h3></span>
                )}
            </div>

            {/* Date */}
            <div className="font-semibold mb-1">
                <CalendarLink listing={item} location="" dateLabel={item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`} />
            </div>

            {/* Badges */}
            <div className="flex flex-row flex-wrap gap-2">
                <DateNote startDate={item.StartDate} endDate={item.EndDate} />
                {item.isOnViewToday && (
                    <Badge variant="outline" className="!border-green-300 text-black">On View Today</Badge>
                )}
            </div>

            {/* Notes */}
            <NotesRenderer notes={item.Notes} itemIndex={item._id} />

            {/* Sub-events */}
            {renderOpenings(item)}
        </div>
    );
}

// Mobile bottom sheet content for a location group
function LocationSheet({ group, formatDate }) {
    if (!group) return null;
    const { locationName, locationAddress, locationUrl, locationHours, items } = group;
    const hasOnViewToday = items.some(item => item.isOnViewToday === true);

    return (
        <div className="flex flex-col min-h-0 flex-1">
            {/* Sticky header */}
            <div className="px-4 pt-2 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold mb-2">{locationName}</h2>
                <div className="flex gap-4 text-sm">
                    <a
                        className="flex items-start gap-1.5 text-gray-600 hover:text-black underline decoration-dashed"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {locationAddress}
                    </a>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                    {locationUrl && (
                        <a
                            className="flex items-center gap-1.5 text-gray-600 hover:text-black underline decoration-dashed"
                            href={locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Website
                        </a>
                    )}
                    {hasOnViewToday && (
                        <HoursPopup
                            locationName={locationName}
                            locationHours={locationHours}
                            locationUrl={locationUrl}
                        >
                            <button className="flex items-center gap-1.5 text-gray-600 hover:text-black text-sm underline decoration-dashed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Hours
                            </button>
                        </HoursPopup>
                    )}
                </div>
            </div>

            {/* Scrollable show list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
                {items.map((item, i) => (
                    <ShowCard key={i} item={item} formatDate={formatDate} />
                ))}
            </div>
        </div>
    );
}

export default function MapView({
    filteredListings,
    locations,
    highlightsOnly,
    selectedLocation,
    selectedCounty,
    searchTerm,
    userLocation,
}) {
    const [L, setL] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Load Leaflet when component mounts
    useEffect(() => {
        import('leaflet').then(L => {
            setL(L);
        });
    }, []);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!L) {
        return (
            <div className="h-full border w-full flex items-center justify-center" role="status" aria-label="Loading map">
                <div className="animate-pulse text-2xl text-gray-500">Loading map...</div>
            </div>
        );
    }

    // Filter listings for map display
    const filteredItems = filteredListings
        .filter(item => highlightsOnly ? item.Highlight : true)
        .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
        .filter(item => item.locationName.toLowerCase() !== 'various')
        .filter(item => {
            const searchLower = searchTerm.toLowerCase();

            return item.Event.toLowerCase().includes(searchLower) ||
                   item.locationName.toLowerCase().includes(searchLower) ||
                   (item.locationAddress ? item.locationAddress.toLowerCase().includes(searchLower) : false) ||
                   extractPortableTextContent(item.Notes).toLowerCase().includes(searchLower) ||
                   (item.locationUrl ? item.locationUrl.toLowerCase().includes(searchLower) : false);
        });

    // Group listings by location coordinates
    const locationGroups = {};

    filteredItems.forEach(item => {
        const location = locations.find(loc => loc.Name === item.locationName);
        if (location && location.Geolocation) {
            const key = `${location.Geolocation.lat},${location.Geolocation.lng}`;
            if (!locationGroups[key]) {
                locationGroups[key] = {
                    position: [location.Geolocation.lat, location.Geolocation.lng],
                    location: location,
                    locationName: item.locationName,
                    locationAddress: item.locationAddress,
                    locationUrl: item.locationUrl,
                    locationHours: item.locationHours,
                    items: []
                };
            }
            locationGroups[key].items.push(item);
        }
    });

    const markerPositions = Object.values(locationGroups).map(g => g.position);

    // Blue dot icon for user's position
    const userLocationIconUrl = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='9' fill='%234A90D9' stroke='white' stroke-width='2'/%3E%3Ccircle cx='10' cy='10' r='4' fill='white'/%3E%3C/svg%3E`;

    const userMarker = userLocation ? (
        <Marker
            key="user-location"
            position={[userLocation.lat, userLocation.lng]}
            icon={L.icon({
                iconUrl: userLocationIconUrl,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -12]
            })}
        >
            <Popup>
                <span className="text-sm font-medium">Your location</span>
            </Popup>
        </Marker>
    ) : null;


    const markers = Object.entries(locationGroups).map(([key, group]) => {
        const totalItems = group.items.length;

        // Check if any item in the group is "on view today" using the pre-computed flag
        // (accounts for both show dates AND venue hours)
        const hasOnViewToday = group.items.some(item => item.isOnViewToday === true);

        // Single pin with green dot (on view today)
        const singlePinOpenIcon = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z' fill='%2393D884' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

        // Single pin without green dot (not on view today)
        const singlePinClosedIcon = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

        // Multiple pin with green dot (at least one on view today)
        const multiplePinOpenIcon = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_2001_97)'%3E%3Cpath d='M19 10C19 17 10 23 10 23C10 23 1 17 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M23 10C23 17 14 23 14 23C14 23 5 17 5 10C5 7.61305 5.94821 5.32387 7.63604 3.63604C9.32387 1.94821 11.6131 1 14 1C16.3869 1 18.6761 1.94821 20.364 3.63604C22.0518 5.32387 23 7.61305 23 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 13C15.6569 13 17 11.6569 17 10C17 8.34315 15.6569 7 14 7C12.3431 7 11 8.34315 11 10C11 11.6569 12.3431 13 14 13Z' fill='%2393D884' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_2001_97'%3E%3Crect width='24' height='24' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`;

        // Multiple pin without green dot (none on view today)
        const multiplePinClosedIcon = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_2001_109)'%3E%3Cpath d='M19 10C19 17 10 23 10 23C10 23 1 17 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M23 10C23 17 14 23 14 23C14 23 5 17 5 10C5 7.61305 5.94821 5.32387 7.63604 3.63604C9.32387 1.94821 11.6131 1 14 1C16.3869 1 18.6761 1.94821 20.364 3.63604C22.0518 5.32387 23 7.61305 23 10Z' fill='%23F5E8A0' stroke='black' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_2001_109'%3E%3Crect width='24' height='24' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`;

        // Select icon based on number of items and on-view-today status
        const getIconUrl = () => {
            if (totalItems > 1) {
                return hasOnViewToday ? multiplePinOpenIcon : multiplePinClosedIcon;
            }
            return hasOnViewToday ? singlePinOpenIcon : singlePinClosedIcon;
        };

        return (
            <Marker
                key={key}
                position={group.position}
                icon={L.icon({
                    iconUrl: getIconUrl(),
                    iconSize: [24, 24],
                    iconAnchor: [12, 23],
                    popupAnchor: [0, -23]
                })}
                eventHandlers={{
                    click: () => setSelectedGroup(group)
                }}
            >
            </Marker>
        );
    });

    return (
        <div id="map-view" className="w-full h-full relative">
            <div className="h-full w-full">
                <MapContainer center={[37.7749, -122.4194]} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />
                    <MapController selectedCounty={selectedCounty} markerPositions={markerPositions} userLocation={userLocation} />
                    {markers}
                    {userMarker}
                </MapContainer>
            </div>

            {/* Desktop side panel */}
            <div className={`hidden lg:flex flex-col absolute top-0 bottom-0 right-0 w-96 bg-white shadow-xl z-[1000] transition-transform duration-300 ease-in-out ${selectedGroup ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedGroup && (
                    <>
                        <button
                            onClick={() => setSelectedGroup(null)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            aria-label="Close panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <LocationSheet group={selectedGroup} formatDate={formatDate} />
                    </>
                )}
            </div>

            {/* Mobile bottom sheet */}
            <Drawer open={isMobile && !!selectedGroup} onOpenChange={(open) => { if (!open) setSelectedGroup(null); }}>
                <DrawerContent className="flex flex-col max-h-[70vh]">
                    <LocationSheet group={selectedGroup} formatDate={formatDate} />
                </DrawerContent>
            </Drawer>
        </div>
    );
}
