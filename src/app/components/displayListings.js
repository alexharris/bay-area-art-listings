'use client'

import { useState, useEffect, useRef } from 'react';
import getListings from './getListings';
import getLocations from './getLocations';
import CalendarLink from './calendarLink';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set default icon options
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function displayListings() {
  
    const [sortType, setSortType] = useState('date');
    const [listings, setListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [showDetails, setShowDetails] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [displayedResults, setDisplayedResults] = useState(0);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('')
    const [isMapView, setIsMapView] = useState(false);
    const [sortedListings, setSortedListings] = useState([]);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    //
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


    useEffect(() => console.log('1'), [sortType]);
    useEffect(() => console.log('2'), [highlightsOnly]);
    useEffect(() => console.log('3'), [searchTerm]);
    useEffect(() => console.log('4'), [listings]);
    useEffect(() => console.log('5'), [selectedLocation]);
    useEffect(() => console.log('6'), [sortedListings]);

    // useEffect(() => {
    //     if (isMapView) {
    //         // Dynamically import Leaflet and related assets
    //         // Because otherwise it gives "window not found" error
    //         import('leaflet').then(L => {
    //             import('leaflet/dist/leaflet.css');
    //             import('leaflet/dist/images/marker-icon.png').then(markerIcon => {
    //                 import('leaflet/dist/images/marker-shadow.png').then(markerShadow => {
                      
    //                         mapRef.current = L.map('map').setView([37.7749, -122.4194], 8); // Centered on San Francisco
    //                         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //                             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //                         }).addTo(mapRef.current);

    //                         // Set default icon options
    //                         const DefaultIcon = L.icon({
    //                             iconUrl: markerIcon.default,
    //                             shadowUrl: markerShadow.default
    //                         });
    //                         L.Marker.prototype.options.icon = DefaultIcon;
                        

    //                     // Clear existing markers
    //                     markersRef.current.forEach(marker => marker.remove());
    //                     markersRef.current = [];
                        
    //                     console.log('placing new markers')
    //                     // Add new markers
    //                     console.log('highlightsOnly:', highlightsOnly, 'searchTerm:', searchTerm, 'selectedLocation:', selectedLocation);
    //                     sortedListings.filter(item => highlightsOnly ? item.Highlight : true)
    //                     .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
    //                     .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
    //                     .forEach(item => {
    //                         const location = locations.find(loc => loc.Name === item.locationName);
    //                         if (location && location.Geolocation) {
    //                             const marker = L.marker([location.Geolocation.lat, location.Geolocation.lng])
    //                                 .addTo(mapRef.current)
    //                                 .bindPopup(`<b>${item.Event}</b><br>${item.locationName}<br>${item.locationAddress}`);
    //                             markersRef.current.push(marker);
    //                         }
    //                     });
    //                 });
    //             });
    //         });
    //     }
    // }, [isMapView, sortedListings, highlightsOnly, searchTerm, listings, selectedLocation]);


    function toggleHighlights() {
        console.log('toggleHighlights called')
        setHighlightsOnly(!highlightsOnly);
    }


    function sortListings(listingsToSort = listings) {
        let sorted = [...listingsToSort];
        if (sortType === 'alphabetical') {
            sorted = sorted.sort((a, b) => a.Artist.localeCompare(b.Artist));
        } else if (sortType === 'date') {
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start))
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
            sorted = sorted.sort((a, b) => new Date(a.Start) - new Date(b.Start))
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
        } 
        else if (sortType === 'closethismonth') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            now.setDate(now.getDate() - 1);
            sorted = sorted.filter(item => {
                const endDate = new Date(item.End);
                return endDate >= startOfMonth && endDate <= endOfMonth;
            });
        }
        else if (sortType === 'tonight') {
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
                    {isMapView ? (
                        <div id="map-view" className="w-full">
                            {/* <div className="h-[50vh] border w-full" id="map"></div> */}
                            <div className="h-[50vh] border w-full">
                            <MapContainer center={[37.7749, -122.4194]} zoom={8} scrollWheelZoom={true} className="h-[50vh] border w-full">

                                <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                { 
                                sortedListings
                                    .filter(item => highlightsOnly ? item.Highlight : true)
                                    .filter(item => selectedLocation ? item.locationName === selectedLocation : true)
                                    .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((item, index) => {
                                        const location = locations.find(loc => loc.Name === item.locationName);
                                        return location && location.Geolocation ? (
                                            <Marker key={index} position={[location.Geolocation.lat, location.Geolocation.lng]}>
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


