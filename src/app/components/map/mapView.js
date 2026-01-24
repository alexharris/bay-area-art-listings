'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { extractPortableTextContent } from '../../../utils/helpers';
import TodaysHoursStatus from '../TodaysHoursStatus';
import HoursPopup from '../HoursPopup';

// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Don't show year if its the current year
function formatDate(dateString) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

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
            <div className="h-screen border w-full flex items-center justify-center">
                <div className="animate-pulse text-2xl">🗺️ Loading map...</div>
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
        
        // Check if any item in the group is "on view today"
        const hasOnViewToday = group.items.some(item => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const startDate = new Date(item.StartDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(item.EndDate);
            endDate.setHours(0, 0, 0, 0);
            
            return startDate <= today && endDate >= today;
        });
        
        // Use green dot if on view today
        const hasGreenDot = hasOnViewToday;
        
        // Create place marker pin SVG - all grey with green dot where applicable
        const createPinIcon = (hasGreenDot, multiple = false) => {
            const pinColor = '%23d4d4d8'; // Light grey for all pins
            const innerDot = hasGreenDot ? '%3Ccircle cx=\'20\' cy=\'8\' r=\'5.5\' fill=\'%2316a34a\' stroke=\'black\' stroke-width=\'1.5\' /%3E' : '';
            
            if (multiple) {
                // Multiple items - larger pin with subtle layered effect
                const multiDot = hasGreenDot ? '%3Ccircle cx=\'22\' cy=\'10\' r=\'5.5\' fill=\'%2316a34a\' stroke=\'black\' stroke-width=\'1.5\' /%3E' : '';
                return `data:image/svg+xml,%3Csvg width='36' height='44' viewBox='0 0 36 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.3'%3E%3Cpath d='M16 9c-5 0-9 4-9 9 0 7 9 16 9 16s9-9 9-16c0-5-4-9-9-9z' fill='${pinColor}' stroke='black' strokeWidth='1.5'/%3E%3C/g%3E%3Cg opacity='0.3'%3E%3Cpath d='M18 9c-5 0-9 4-9 9 0 7 9 16 9 16s9-9 9-16c0-5-4-9-9-9z' fill='${pinColor}' stroke='black' strokeWidth='1.5'/%3E%3C/g%3E%3Cpath d='M20 9c-5 0-9 4-9 9 0 7 9 16 9 16s9-9 9-16c0-5-4-9-9-9z' fill='${pinColor}' stroke='black' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E${multiDot}%3C/svg%3E`;
            } else {
                // Single item - standard pin
                return `data:image/svg+xml,%3Csvg width='28' height='38' viewBox='0 0 28 38' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 2c-5.523 0-10 4.477-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z' fill='${pinColor}' stroke='black' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E${innerDot}%3C/svg%3E`;
            }
        };
        
        return (
            <Marker 
                key={key} 
                position={group.position}
                icon={L.icon({
                    iconUrl: createPinIcon(hasGreenDot, totalItems > 1),
                    iconSize: totalItems > 1 ? [36, 44] : [28, 38],
                    iconAnchor: totalItems > 1 ? [20, 44] : [14, 38],
                    popupAnchor: totalItems > 1 ? [0, -44] : [0, -38]
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
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        
                    </a>
                    {group.locationUrl && (
                        <a
                        className="flex flex-row gap-1 items-center text-black hover:text-blue-600"
                        href={group.locationUrl} 
                        target="_blank"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                        
                        </a>
                    )}
                    {hasOnViewToday && (
                        <HoursPopup
                        locationName={group.locationName}
                        locationHours={group.locationHours}
                        locationUrl={group.locationUrl}
                        >
                        <button className="flex flex-row gap-1 items-center text-black hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            
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
