'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { extractPortableTextContent } from '../../../utils/helpers';
import TodaysHoursStatus from '../TodaysHoursStatus';
import HoursPopup from '../HoursPopup';
import { formatDate } from '../../../utils/shared';

// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// ShowCard component for displaying individual show details
function ShowCard({ item, compact = false }) {
    const description = item.Notes ? extractPortableTextContent(item.Notes) : '';
    
    return (
        <div className="flex flex-col border border-gray-100 p-3 rounded-md">
            <div className="flex gap-3">
                {item.eventImageUrl && (
                    <div className="flex-shrink-0">
                        <img 
                            src={item.eventImageUrl} 
                            alt={item.eventImageCaption || item.Event}
                            className="w-24 h-24 object-cover rounded"
                        />
                        {item.eventImageCaption && (
                            <p className="text-xs text-gray-500 mt-1 italic w-24">{item.eventImageCaption}</p>
                        )}
                    </div>
                )}
                
                <div className="flex flex-col flex-1 min-w-0">
                    {item.EventUrl ? (
                        <a
                            href={item.EventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-medium hover:text-blue-600 transition-colors"
                        >
                            {item.Event}
                        </a>
                    ) : (
                        <span className="text-lg font-medium">
                            {item.Event}
                        </span>
                    )}
                    <span className="text-sm text-gray-600 mb-2">
                        {item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`}
                    </span>
                    
                    {description && (
                        <div className="max-h-36 overflow-y-scroll text-sm text-gray-700 leading-relaxed">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MapView({ 
    filteredListings, 
    locations, 
    highlightsOnly, 
    selectedLocation, 
    searchTerm 
}) {
    const [L, setL] = useState(null);
    const [carouselIndices, setCarouselIndices] = useState({});

    // Load Leaflet when component mounts
    useEffect(() => {
        import('leaflet').then(L => {
            setL(L);
        });
    }, []);

    if (!L) {
        return (
            <div className="h-screen border w-full flex items-center justify-center" role="status" aria-label="Loading map">
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

    const toggleShow = (key, direction) => {
        setCarouselIndices(prev => {
            const currentIndex = prev[key] || 0;
            const totalItems = locationGroups[key].items.length;
            const newIndex = direction === 'next'
                ? (currentIndex + 1) % totalItems
                : (currentIndex - 1 + totalItems) % totalItems;
            return {
                ...prev,
                [key]: newIndex
            };
        });
    };

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
            >
            <Popup className="location-popup" maxWidth={400}>
                <div className="popup-content">
                {/* Header bar with location info */}
                <div className="pb-3 mb-4">
                    <h2 className="text-xl font-semibold mb-1">{group.locationName}</h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                    <a
                        className="flex flex-row gap-1 items-center text-black hover:text-blue-600"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View on Google Maps"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </a>
                    {group.locationUrl && (
                        <a
                        className="flex flex-row gap-1 items-center text-black hover:text-blue-600"
                        href={group.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit venue website"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </a>
                    )}
                    {hasOnViewToday && (
                        <HoursPopup
                        locationName={group.locationName}
                        locationHours={group.locationHours}
                        locationUrl={group.locationUrl}
                        >
                        <button className="flex flex-row gap-1 items-center text-black hover:text-blue-600" aria-label="View hours">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                        </HoursPopup>
                    )}
                    </div>
                </div>
                
                {/* Shows section */}
                <div>
                    {totalItems === 1 ? (
                    // Single show - display directly
                    <ShowCard item={group.items[0]} />
                    ) : (
                    // Multiple shows - carousel
                    <div className="space-y-4">
                        <ShowCard item={group.items[carouselIndices[key] || 0]} />
                        
                        <div className="flex flex-row justify-end items-center gap-3">
                        <button 
                            onClick={() => toggleShow(key, 'prev')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Previous show"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <span className="text-sm text-gray-500 font-medium min-w-[3rem] text-center">
                            {(carouselIndices[key] || 0) + 1} of {totalItems}
                        </span>
                        <button 
                            onClick={() => toggleShow(key, 'next')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Next show"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </Popup>
            </Marker>
        );
    });

    return (
        <div id="map-view" className="w-full">
            <div className="h-screen w-full">
                <MapContainer center={[37.7749, -122.4194]} zoom={10} scrollWheelZoom={true} className="h-screen w-full z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    />
                    {markers}
                </MapContainer>
            </div>
        </div>
    );
}
