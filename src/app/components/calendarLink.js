import React, { useState } from 'react';

export default function calendarLink(data) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    let listing = data.listing;

    const eventDetailsString = `Event: ${listing.Event}\nLocation: ${listing.locationName}\nAddress: ${listing.locationAddress}\nURL: ${listing.locationUrl}\n${listing.Notes ? `Notes: ${listing.Notes}` : ''}`;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0].replace(/-/g, '');
    };

    const startDateFormatted = formatDate(listing.StartDate);
    const endDateFormatted = formatDate(listing.EndDate);

    const googleCalendarUrl = (startDate, endDate) => {
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        const eventTitle = selectedDate === 'start' ? `${listing.Event} (Opening Date)` : selectedDate === 'end' ? `${listing.Event} (Ending Date)` : listing.Event;
        url.searchParams.append('text', eventTitle);
        url.searchParams.append('dates', `${startDate}/${endDate}`);
        url.searchParams.append('details', eventDetailsString);
        url.searchParams.append('location', listing.locationName);
        return url;
    };

    const handleRadioChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleAddToCalendar = () => {
        if (selectedDate === 'start') {
            window.open(googleCalendarUrl(startDateFormatted, startDateFormatted), '_blank');
        } else if (selectedDate === 'end') {
            window.open(googleCalendarUrl(endDateFormatted, endDateFormatted), '_blank');
        } else if (selectedDate === 'range') {
            window.open(googleCalendarUrl(startDateFormatted, endDateFormatted), '_blank');
        }
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="underline">
                Open Calendar Link
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white p-4 rounded shadow-lg w-1/2 h-1/2 flex flex-col relative z-10" onClick={(e) => e.stopPropagation()}>
                        <span className="absolute top-0 right-0 p-4 cursor-pointer" onClick={() => setIsModalOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                        <h1 className="font-bold pb-4">Add To Calendar</h1>
                        <label>
                            <input
                                type="radio"
                                name="date"
                                value="start"
                                checked={selectedDate === 'start'}
                                onChange={handleRadioChange}
                                className="mr-2"
                            />
                            Start Date ({listing.StartDate})
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="date"
                                value="end"
                                checked={selectedDate === 'end'}
                                onChange={handleRadioChange}
                                className="mr-2"
                            />
                            End Date ({listing.EndDate})
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="date"
                                value="range"
                                checked={selectedDate === 'range'}
                                onChange={handleRadioChange}
                                className="mr-2"
                            />
                            Full Date Range ({listing.StartDate} - {listing.EndDate})
                        </label>
                        <button onClick={handleAddToCalendar} className="mt-4 p-2 bg-blue-500 text-white rounded">
                            Add To Calendar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}