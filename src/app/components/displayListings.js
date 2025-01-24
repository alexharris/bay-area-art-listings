'use client'

import { useState, useEffect, useRef } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import CalendarLink from './calendarLink';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapContainer, TileLayer, Marker, and Popup from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function displayListings() {
    const [sortType, setSortType] = useState('date');
    const [listings, setListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [showDetails, setShowDetails] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [displayedResults, setDisplayedResults] = useState(0);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [isMapView, setIsMapView] = useState(false);
    const [sortedListings, setSortedListings] = useState([]);
    const [L, setL] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getListings();
                setListings(data);
                setSortType('date');
                sortListings(data);
                const locationData = await getLocations();
                setLocations(locationData); 
            } catch (error) {
                console.error('Data retrieval failed:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);  

    useEffect(() => {
        const filteredListings = sortedListings
            .filter(item => highlightsOnly ? item.Highlight : true)
            .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
            .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()));
        setDisplayedResults(filteredListings.length);
    }, [sortType, highlightsOnly, searchTerm, listings, selectedLocation, sortedListings]);

    useEffect(() => {
        if (isMapView) {
            // Dynamically import Leaflet and related assets
            import('leaflet').then(L => {
                setL(L);
            });
        }
    }, [isMapView]);

    function toggleHighlights() {
        setHighlightsOnly(!highlightsOnly);
    }

    function sortListings(listingsToSort = listings) {
        let sorted = [...listingsToSort];
        if (sortType === 'alphabetical') {
            sorted = sorted.sort((a, b) => a.Artist.localeCompare(b.Artist));
        } else if (sortType === 'date') {
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start));
        } else if (sortType === 'thisweek') {
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start));
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= now && startDate <= nextWeek;
            });
        } else if (sortType === 'thismonth') {
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start));
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= startOfMonth && startDate <= endOfMonth;
            });
        } else if (sortType === 'nextmonth') {
            const now = new Date();
            const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= startOfNextMonth && startDate <= endOfNextMonth;
            });
        } else if (sortType === 'closethisweek') {
            const now = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(now.getDate() + 7);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const endDate = new Date(item.End);
                return endDate >= now && endDate <= endOfWeek;
            });
        } else if (sortType === 'closethismonth') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const endDate = new Date(item.End);
                return endDate >= startOfMonth && endDate <= endOfMonth;
            });
        } else if (sortType === 'tonight') {
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start));
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate());
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= now && startDate <= tomorrow;
            });
        }
        setSortedListings(sorted);
    }    

    useEffect(() => {
        sortListings();
    }, [sortType, listings, highlightsOnly]);

    return (
        <>
        <div className="bg-gray-50 p-4 w-full flex flex-col">
            <button 
                onClick={() => {
                    setSortType('date');
                    setHighlightsOnly(false);
                    setSearchTerm('');
                    setSelectedLocation('');
                }} 
                className="place-self-end"
            >
                Clear All Filters
            </button>
            <div className="flex flex-col items-start md:flex-row flex-wrap justify-start gap-4">
                <div className="flex flex-col p-2">
                    <label htmlFor="filterResults">Time</label>
                    <select id="filterResults" value={sortType} onChange={(e) => setSortType(e.target.value)} className="p-1 bg-white border">
                        <option value="date" defaultValue>All</option>
                        {/* <option value="alphabetical">Alphabetical</option> */}
                        <option value="tonight">Tonight</option>
                        <option value="thisweek">Opening This Week</option>
                        <option value="thismonth">Opening This Month</option>
                        <option value="nextmonth">Opening Next Month</option>
                        <option value="closethisweek">Closing This Week</option>
                        <option value="closethismonth">Closing This Month</option>
                    </select>
                </div>
                <div className="flex flex-col p-2 w-48">
                    <label htmlFor="locationFilter">Venue</label>
                    <select 
                        id="locationFilter" 
                        onChange={(e) => setSelectedLocation(e.target.value)} 
                        className="p-1 bg-white border"
                    >
                        <option value="">All Locations</option>
                        {locations.map((location, index) => (
                            <option key={index} value={location.Name}>{location.Name}</option>
                        ))}
                    </select>
                </div>                 
                <label className="p-2">
                    <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={highlightsOnly} 
                        onChange={toggleHighlights} 
                    />
                    Highlights Only
                </label>
                <div className="flex flex-col p-2 grow">
                    <label htmlFor="searchTerm">Search</label>
                    <input 
                        type="text" 
                        id="searchTerm"
                        className="p-1 border"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>
        </div>
            {loading ? (
                <div className="spinner animate-spin text-3xl text-center w-full">
                    🎨
                </div>
            ) : (
                <>
                    <div>
                        <p>{displayedResults} results found</p>
                    </div>     
                    <div className="flex flex-row gap-4">
                        <span 
                            className={isMapView ? '' : 'font-bold'} 
                            onClick={() => setIsMapView(false)}
                        >
                            List View
                        </span>
                        <span 
                            className={isMapView ? 'font-bold' : ''} 
                            onClick={() => setIsMapView(true)}
                        >
                            Map View
                        </span>
                    </div>
                    {isMapView && L ? (
                        <div id="map-view" className="w-full">
                            <div className="h-[50vh] border w-full">
                            <MapContainer center={[37.7749, -122.4194]} zoom={8} scrollWheelZoom={true} className="h-[50vh] border w-full">
                                <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                { 
                                sortedListings
                                    .filter(item => highlightsOnly ? item.Highlight : true)
                                    .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
                                    .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((item, index) => {
                                        const location = locations.find(loc => loc.Name === item.locationName);
                                        
                                        return location && location.Geolocation ? (
                                            <Marker 
                                                key={index} 
                                                position={[location.Geolocation.lat, location.Geolocation.lng]} 
                                                icon={L.icon({
                                                    iconUrl: item.Highlight 
                                                        ? "data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 25.3167C20.1833 19.8333 23.3333 15.1667 23.3333 11.6667C23.3333 9.19131 22.35 6.81734 20.5997 5.067C18.8493 3.31666 16.4754 2.33333 14 2.33333C11.5246 2.33333 9.15068 3.31666 7.40034 5.067C5.65 6.81734 4.66667 9.19131 4.66667 11.6667C4.66667 15.1667 7.81667 19.7167 14 25.3167Z' fill='%23FFD700' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 15.1667C15.933 15.1667 17.5 13.5997 17.5 11.6667C17.5 9.73367 15.933 8.16667 14 8.16667C12.067 8.16667 10.5 9.73367 10.5 11.6667C10.5 13.5997 12.067 15.1667 14 15.1667Z' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A"
                                                        : "data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 25.3167C20.1833 19.8333 23.3333 15.1667 23.3333 11.6667C23.3333 9.19131 22.35 6.81734 20.5997 5.067C18.8493 3.31666 16.4754 2.33333 14 2.33333C11.5246 2.33333 9.15068 3.31666 7.40034 5.067C5.65 6.81734 4.66667 9.19131 4.66667 11.6667C4.66667 15.1667 7.81667 19.7167 14 25.3167Z' fill='%23D9D9D9' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 15.1667C15.933 15.1667 17.5 13.5997 17.5 11.6667C17.5 9.73367 15.933 8.16667 14 8.16667C12.067 8.16667 10.5 9.73367 10.5 11.6667C10.5 13.5997 12.067 15.1667 14 15.1667Z' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A",
                                                })}
                                            >
                                                <Popup>
                                                    <b>{item.Event}</b><br />{item.locationName}<br />{item.locationAddress}
                                                </Popup>
                                            </Marker>
                                        ) : null;
                                    })
                                }
                            </MapContainer>
                            </div>

                        </div>
                    ) : (
                        <ul id="list-view" className="w-full">
                            {
                                sortedListings
                                    .filter(item => highlightsOnly ? item.Highlight : true)
                                    .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
                                    .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((item, index) => (
                                        <li className="border-b border-dashed border-black py-4 w-full" key={index}>
                                            <h2 className="font-bold">{item.Event} @ <a className="underline decoration-wavy" href={item.locationUrl}>{item.locationName}</a> {item.Highlight && '★'}</h2>
                                            <div>{item.Start} - {item.End}</div>
                                            {item.Notes && <div className="mt-2">Notes: {item.Notes}</div>}
                                            <CalendarLink listing={item} />
                                            <button className="text-gray-500 mt-2" onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                                                {showDetails[index] ? 'Hide Details' : 'Show Details'}
                                            </button>
                                            {showDetails[index] && (
                                                <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                                    <div className="prose">
                                                        {/* <div>URL: <a href={item.URL}>{item.URL}</a></div> */}
                                                        <div>Venue: {item.locationName}</div>
                                                        <div>Address: {item.locationAddress}</div>
                                                        <div>Website: <a className="underline" href={item.locationUrl}>{item.locationUrl}</a></div>                                                    
                                                        
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                ))
                            }
                        </ul>
                    )}
                </>
            )}
        </>
    )
}


