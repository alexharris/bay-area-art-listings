'use client'

import { useState, useEffect } from 'react';
import getListings from './getListings';


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
            sortedListings = listings.sort((a, b) => new Date(a.Start + ', 2003') - new Date(b.Start + ', 2003'))
        }
    }    

    return (
        <>
            <div className="flex flex-row gap-4">
                <button className={sortType === "alphabetical" ? 'underline' : ''} onClick={() => setSortType('alphabetical')}>Alphabetical</button>
                <button className={sortType === "date" ? 'underline' : ''} onClick={() => setSortType('date')}>Start Date</button>
                <label>
                    <input 
                        type="checkbox" 
                        checked={highlightsOnly} 
                        onChange={toggleHighlights} 
                    />
                    Highlights Only
                </label>
            </div>
            <ul>
                {sortedListings
                    .filter(item => highlightsOnly ? item.Highlight : true)
                    .map((item, index) => (
                        <li className="border-b border-dashed border-black py-4" key={index}>
                            <h2 className="font-bold">{item.Artist} {item.Highlight && '★'}</h2>
                            <div>{item.Start} - {item.End}</div>
                            <div></div>
                        <button onClick={() => setShowDetails(prev => ({ ...prev, [index]: !prev[index] }))}>
                            {showDetails[index] ? 'Hide Details' : 'Show Details'}
                        </button>
                        {showDetails[index] && (
                            <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                                <div>End Date: {item.End}</div>
                                <div>Event: {item.Event}</div>
                                <div>Location: {item.Location}</div>
                                <div>Address: {item.Address}</div>
                                <div>URL: <a href={item.URL}>{item.URL}</a></div>
                                <div>Highlight: {item.Highlight}</div>
                                <div>Notes: {item.Notes}</div>
                            </div>
                        )}
                        </li>
                    ))}                

            </ul>
        </>
    )
}


