import React, { useState } from 'react';
import AddToAppleCalendar from './addToAppleCalendar';
import { useEffect } from 'react';


export default function calendarLink(data) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('start');
    const [icsEvent, setIcsEvent] = useState({})

    // Set the initial state for the ICS event based on the selected date
    // For APPLE calendar
    useEffect(() => {
        console.log(selectedDate)
        if (selectedDate === 'start') {
            setIcsEvent({
                title: data.listing.Event,
                location: data.listing.locationName,
                startTime: data.listing.StartDate,
                endTime: data.listing.StartDate,
                timezone: "America/Los_Angeles"
            });
        } else if (selectedDate === 'end') {
            setIcsEvent({
                title: data.listing.Event,
                location: data.listing.locationName,
                startTime: data.listing.EndDate,
                endTime: data.listing.EndDate,
                timezone: "America/Los_Angeles"
            });
        } else if (selectedDate === 'range') {
            setIcsEvent({
                title: data.listing.Event,
                location: data.listing.locationName,
                startTime: data.listing.StartDate,
                endTime: data.listing.EndDate,
                timezone: "America/Los_Angeles"
            });
        }
    }, [selectedDate, data.listing]);

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
        <>
            <svg onClick={() => setIsModalOpen(true)} className="feather feather-clock w-8 lg:w-5 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-40" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white p-4 rounded shadow-lg w-11/12 lg:w-1/2 flex flex-col relative z-10" onClick={(e) => e.stopPropagation()}>
                        <span className="absolute top-0 right-0 p-4 cursor-pointer" onClick={() => setIsModalOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                        <h1 className="font-bold pb-4">Add To Calendar</h1>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <fieldset className="flex flex-col items-start space-y-2">
                            <label>
                                <input
                                    type="radio"
                                    name="date"
                                    value="start"
                                    onChange={handleRadioChange}
                                    className="mr-2"
                                    defaultChecked
                                />
                                Start Date ({listing.StartDate})
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="date"
                                    value="end"
                                    onChange={handleRadioChange}
                                    className="mr-2"
                                />
                                End Date ({listing.EndDate})
                            </label>
                            {/* <label>
                                <input
                                    type="radio"
                                    name="date"
                                    value="range"
                                    onChange={handleRadioChange}
                                    className="mr-2"
                                />
                                Full Date Range ({listing.StartDate} - {listing.EndDate})
                            </label> */}
                            </fieldset>
                            <div className="flex flex-row gap-2">
                                <button onClick={() => { handleAddToCalendar(); }} className="mt-4 p-2 bg-blue-500 text-white rounded">
                                    Google Calendar
                                </button>
                                <AddToAppleCalendar data={icsEvent} selectedDate={selectedDate} />                            
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}