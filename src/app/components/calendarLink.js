import React, { useState, useEffect } from 'react';
import AddToAppleCalendar from './addToAppleCalendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export default function calendarLink(data) {
    const [selectedDate, setSelectedDate] = useState('start');
    const [icsEvent, setIcsEvent] = useState({});

    // Set the initial state for the ICS event based on the selected date
    // For APPLE calendar
    useEffect(() => {
        
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
        <Popover>
            <PopoverTrigger asChild>
                <svg 
                    className="feather feather-calendar w-6 lg:w-5 cursor-pointer" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    title="Add to calendar"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Add to Calendar</h4>
                    <div className="text-sm font-medium">{data.listing.Event}</div>
                    <div className="text-sm">
                        <fieldset className="flex flex-col space-y-2 mb-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="date"
                                    value="start"
                                    onChange={handleRadioChange}
                                    className="mr-2"
                                    defaultChecked
                                />
                                <span className="flex-grow">Opening: {listing.StartDate}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="date"
                                    value="end"
                                    onChange={handleRadioChange}
                                    className="mr-2"
                                />
                                <span className="flex-grow">Closing: {listing.EndDate}</span>
                            </label>
                        </fieldset>
                        <div className="flex flex-row gap-2 mt-3">
                            <button 
                                onClick={handleAddToCalendar} 
                                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Google Calendar
                            </button>
                            <AddToAppleCalendar data={icsEvent} selectedDate={selectedDate} />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}