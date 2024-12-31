'use client'

import { useState, useEffect } from 'react';
import getListings from './getListings';
import CalendarLink from './calendarLink';


export default function displayListings() {
  
    const [sortType, setSortType] = useState('date');
    const [listings, setListings] = useState([]);
    const [highlightsOnly, setHighlightsOnly] = useState(false);
    const [showDetails, setShowDetails] = useState({});

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
            }
        }
        fetchData();
    }, []);  


    function toggleHighlights() {
        console.log('toggleHighlights called')
        setHighlightsOnly(!highlightsOnly);
    }

    function sortListings() {
        console.log('sort listings called')
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
        }
    }    

    return (
        <>
            <div className="flex flex-col md:flex-row justify-start gap-4 items-start border border-black p-4">
                <button className={sortType === "date" ? 'underline' : ''} onClick={() => setSortType('date')}>Start Date</button>
                <button className={sortType === "alphabetical" ? 'underline' : ''} onClick={() => setSortType('alphabetical')}>Alphabetical</button>
                <button className={sortType === "thisweek" ? 'underline' : ''} onClick={() => setSortType('thisweek')}>This week</button>
                <label>
                    <input 
                        type="checkbox" 
                        checked={highlightsOnly} 
                        onChange={toggleHighlights} 
                    />
                    Highlights Only
                </label>
            </div>
            <ul className="w-full">
                {sortedListings
                    .filter(item => highlightsOnly ? item.Highlight : true)
                    .map((item, index) => (
                        <li className="border-b border-dashed border-black py-4 w-full" key={index}>
                            <h2 className="font-bold">{item.Highlight && '★'} {item.Artist} {item.Event} @ {item.Location}</h2>
                            <div>{item.Start} - {item.End}</div>
                            <button onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                                {showDetails[index] ? 'Hide Details' : 'Show Details'}
                            </button>
                            {showDetails[index] && (
                                    <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                        <div className="prose">
                                        <div>Start Date: {item.Start}</div>
                                        <div>End Date: {item.End}</div>
                                        <div>Event: {item.Event}</div>
                                        <div>Location: {item.Location}</div>
                                        <div>Address: {item.Address}</div>
                                        <div>URL: <a href={item.URL}>{item.URL}</a></div>
                                        <div>Highlight: {item.Highlight}</div>
                                        <div>Notes: {item.Notes}</div>
                                        <CalendarLink listing={item} />
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}                

            </ul>
        </>
    )
}


