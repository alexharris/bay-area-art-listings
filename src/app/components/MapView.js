'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { extractPortableTextContent } from '../../utils/helpers';
import TodaysHoursStatus from './TodaysHoursStatus';

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

export default function MapView({ 
    filteredListings, 
    locations, 
    highlightsOnly, 
    selectedLocation, 
    searchTerm 
}) {
    const [L, setL] = useState(null);
    const [popupPages, setPopupPages] = useState({});

    // Load Leaflet when component mounts
    useEffect(() => {
        import('leaflet').then(L => {
            setL(L);
        });
    }, []);

    if (!L) {
        return (
            <div className="h-[70vh] border w-full flex items-center justify-center">
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
                   item.locationAddress.toLowerCase().includes(searchLower) ||
                   extractPortableTextContent(item.Notes).toLowerCase().includes(searchLower) ||
                   item.locationUrl.toLowerCase().includes(searchLower);
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
                    locationName: item.locationName,
                    locationAddress: item.locationAddress,
                    items: []
                };
            }
            locationGroups[key].items.push(item);
        }
    });

    const markers = Object.entries(locationGroups).map(([key, group]) => {
        // Get current page for this group or set to 0 if not yet defined
        const currentPage = popupPages[key] || 0;
        const totalItems = group.items.length;
        const currentItem = group.items[currentPage];
        
        const handlePrevious = () => {
            setPopupPages({
                ...popupPages,
                [key]: (currentPage - 1 + totalItems) % totalItems
            });
        };
        
        const handleNext = () => {
            setPopupPages({
                ...popupPages,
                [key]: (currentPage + 1) % totalItems
            });
        };
        
        return (
            <Marker 
                key={key} 
                position={group.position}
                icon={L.icon({
                    iconUrl: totalItems > 1 
                        ? "data:image/svg+xml,%3Csvg width='20' height='16' viewBox='0 0 20 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.00001 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8.00001 1.33333C4.31811 1.33333 1.33334 4.3181 1.33334 8C1.33334 11.6819 4.31811 14.6667 8.00001 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3Cpath d='M10 14.6667C13.6819 14.6667 16.6667 11.6819 16.6667 8C16.6667 4.3181 13.6819 1.33333 10 1.33333C6.31811 1.33333 3.33334 4.3181 3.33334 8C3.33334 11.6819 6.31811 14.6667 10 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3Cpath d='M12 14.6667C15.6819 14.6667 18.6667 11.6819 18.6667 8C18.6667 4.3181 15.6819 1.33333 12 1.33333C8.31811 1.33333 5.33334 4.3181 5.33334 8C5.33334 11.6819 8.31811 14.6667 12 14.6667Z' fill='%239ACD32' stroke='black' strokeWidth='0.666667' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E%0A"
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='yellowgreen' fill-opacity='1' stroke='currentColor' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round' class='feather feather-circle'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E"
                })}
            >
                <Popup>
                    <div className="popup-content flex flex-col gap-2">
                        {currentItem.EventUrl
                            ? <a 
                                href={currentItem.EventUrl}
                                target="_blank"
                                className="text-xl lg:text-xl mb-2 lg:mb-0"
                                >
                                <h2>{currentItem.Event}</h2>
                                </a>
                            : <span
                                className="text-2xl lg:text-3xl mb-2 lg:mb-0"
                                >
                                <h2>{currentItem.Event}</h2>
                                </span>
                        }  
                        <span className="font-semibold">
                            {currentItem.DateOverride || `${formatDate(currentItem.StartDate)} - ${formatDate(currentItem.EndDate)}`}
                        </span>                                                            
                        <a
                            className="flex flex-row gap-1 items-center text-black"
                            href={currentItem.locationUrl} 
                            target="_blank"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-globe w-4" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>                        
                            {currentItem.locationName}
                        </a>
                        
                        <a
                            className="flex flex-row gap-1 items-center text-black"
                            target='_blank'
                            href={currentItem.locationUrl}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-4" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {currentItem.locationAddress}
                        </a>
                        <TodaysHoursStatus locationHours={currentItem.locationHours} locationUrl={currentItem.locationUrl} />
                        
                        {totalItems > 1 && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <button 
                                    onClick={handlePrevious}
                                    className="text-sm px-2 hover:bg-gray-100 flex flex-row gap-1 items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Prev
                                </button>
                                <span className="text-xs text-gray-500">
                                    {currentPage + 1} of {totalItems}
                                </span>
                                <button 
                                    onClick={handleNext}
                                    className="text-sm px-2 hover:bg-gray-100 flex flex-row gap-1 items-center"
                                >
                                    Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </Popup>
            </Marker>
        );
    });

    return (
        <div id="map-view" className="w-full">
            <div className="h-[70vh] border w-full">
                <MapContainer center={[37.7749, -122.4194]} zoom={9} scrollWheelZoom={true} className="h-[70vh] border w-full z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markers}
                </MapContainer>
            </div>
        </div>
    );
}
