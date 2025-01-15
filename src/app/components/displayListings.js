'use client'

import { useState, useEffect } from 'react';
import getListings from './getListings';
import CalendarLink from './calendarLink';



export default function displayListings() {
  
    const [sortType, setSortType] = useState('date');
    const [listings, setListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [showDetails, setShowDetails] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [displayedResults, setDisplayedResults] = useState(0);

    let sortedListings = [...listings];

    sortListings();

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getListings();
                setListings(data);
                setSortType('date');
                sortListings();
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
            .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()));
        setDisplayedResults(filteredListings.length);
    }, [sortType, highlightsOnly, searchTerm, listings]);

    function toggleHighlights() {
        console.log('toggleHighlights called')
        setHighlightsOnly(!highlightsOnly);
    }

    function sortListings() {
        if (sortType === 'alphabetical') {
            sortedListings = listings.sort((a, b) => a.Artist.localeCompare(b.Artist));

        } else if (sortType === 'date') {
            sortedListings = listings.sort((a, b) => new Date(a.Start) - new Date(b.Start))
        } else if (sortType === 'thisweek') {
            sortedListings = listings.sort((a, b) => new Date(a.Start) - new Date(b.Start))
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            sortedListings = listings.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= now && startDate <= nextWeek;
            });
        } else if (sortType === 'thismonth') {
            sortedListings = listings.sort((a, b) => new Date(a.Start) - new Date(b.Start))
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            sortedListings = listings.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= startOfMonth && startDate <= endOfMonth;
            });
        } else if (sortType === 'nextmonth') {
            const now = new Date();
            const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            sortedListings = listings.filter(item => {
                const startDate = new Date(item.Start);
                return startDate >= startOfNextMonth && startDate <= endOfNextMonth;
            });
        } else if (sortType === 'closethisweek') {
            const now = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(now.getDate() + 7);
            sortedListings = listings.filter(item => {
                const endDate = new Date(item.End);
                return endDate >= now && endDate <= endOfWeek;
            });
        } 
        else if (sortType === 'closethismonth') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            sortedListings = listings.filter(item => {
                const endDate = new Date(item.End);
                return endDate >= startOfMonth && endDate <= endOfMonth;
            });
        }
        
    }    

    return (
        <>
            <div className="flex flex-col items-start md:flex-row justify-start gap-4 items-start bg-gray-50 p-4 w-full">
                <div className="flex flex-col p-2">
                    <label htmlFor="filterResults">Filter Results</label>
                    <select id="filterResults" value={sortType} onChange={(e) => setSortType(e.target.value)} className="p-1 bg-white border">
                        <option value="date" defaultValue>All</option>
                        {/* <option value="alphabetical">Alphabetical</option> */}
                        <option value="thisweek">Opening This Week</option>
                        <option value="thismonth">Opening This Month</option>
                        <option value="nextmonth">Opening Next Month</option>
                        <option value="closethisweek">Closing This Week</option>
                        <option value="closethismonth">Closing This Month</option>
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
                <div className="flex flex-col p-2">
                    <label htmlFor="searchTerm">Search</label>
                    <input 
                        type="text" 
                        id="searchTerm"
                        className="p-1 border"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <button 
                    onClick={() => {
                        setSortType('date');
                        setHighlightsOnly(false);
                        setSearchTerm('');
                    }} 
                    className="p-2"
                >
                    Clear Filters
                </button>
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
                    <ul className="w-full">
                        {
                            sortedListings
                                .filter(item => highlightsOnly ? item.Highlight : true)
                                .filter(item => item.Event.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || item.Notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((item, index) => (
                                    <li className="border-b border-dashed border-black py-4 w-full" key={index}>
                                        <h2 className="font-bold">{item.Highlight && '★'} {item.Event} @ {item.locationName}</h2>
                                        <div>{item.Start} - {item.End}</div>
                                        <button onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                                            {showDetails[index] ? 'Hide Details' : 'Show Details'}
                                        </button>
                                        {showDetails[index] && (
                                            <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                                <div className="prose">
                                                    <div>{item.locationAddress}</div>
                                                    <div>URL: <a href={item.URL}>{item.URL}</a></div>
                                                    <div>Notes: {item.Notes}</div>
                                                    <CalendarLink listing={item} />
                                                </div>
                                            </div>
                                        )}
                                    </li>
                            ))
                        }
                    </ul>
                </>
            )}
        </>
    )
}


