import React, { useState, useEffect } from 'react';
import AddToAppleCalendar from './AddToAppleCalendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";


export default function CalendarLink({ dateLabel, listing, location, singleEvent }) {
    const [selectedDate, setSelectedDate] = useState('start');
    const [icsEvent, setIcsEvent] = useState({});

    useEffect(() => {
        if (singleEvent) {
            setIcsEvent({
                title: singleEvent.title,
                location: singleEvent.locationName,
                startTime: singleEvent.date + 'T12:00:00',
                endTime: singleEvent.date + 'T12:00:00',
                timezone: "America/Los_Angeles"
            });
            return;
        }
        if (!listing) return;
        if (selectedDate === 'start') {
            setIcsEvent({
                title: listing.Event,
                location: listing.locationName,
                startTime: listing.StartDate,
                endTime: listing.StartDate,
                timezone: "America/Los_Angeles"
            });
        } else if (selectedDate === 'end') {
            setIcsEvent({
                title: listing.Event,
                location: listing.locationName,
                startTime: listing.EndDate,
                endTime: listing.EndDate,
                timezone: "America/Los_Angeles"
            });
        } else if (selectedDate === 'range') {
            setIcsEvent({
                title: listing.Event,
                location: listing.locationName,
                startTime: listing.StartDate,
                endTime: listing.EndDate,
                timezone: "America/Los_Angeles"
            });
        }
    }, [selectedDate, listing, singleEvent]);

    const handleRadioChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Single-event mode (openings / subevents)
    if (singleEvent) {
        const dateFormatted = singleEvent.date.replace(/-/g, '');
        const gcalUrl = new URL('https://www.google.com/calendar/render');
        gcalUrl.searchParams.append('action', 'TEMPLATE');
        gcalUrl.searchParams.append('text', singleEvent.title);
        gcalUrl.searchParams.append('dates', `${dateFormatted}/${dateFormatted}`);
        gcalUrl.searchParams.append('location', singleEvent.locationName || '');

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="cursor-pointer underline decoration-dashed decoration-gray-400 underline-offset-2 text-left"
                        aria-label="Add to calendar"
                    >
                        {dateLabel}
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Add to Calendar</h4>
                            <PopoverClose className="text-gray-400 hover:text-gray-600 p-0.5 -mr-1" aria-label="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </PopoverClose>
                        </div>
                        <div className="text-sm font-medium">{singleEvent.title}</div>
                        <div className="text-sm text-gray-500">{dateLabel}</div>
                        <div className="flex flex-row gap-2">
                            <button
                                onClick={() => window.open(gcalUrl, '_blank')}
                                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Google Calendar
                            </button>
                            <AddToAppleCalendar data={icsEvent} selectedDate="single" />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    // Listing mode (start / end / range)
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
                <button
                    className="cursor-pointer underline decoration-dashed decoration-gray-400 underline-offset-2 text-left"
                    aria-label="Add to calendar"
                >
                    {dateLabel}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Add to Calendar</h4>
                        <PopoverClose className="text-gray-400 hover:text-gray-600 p-0.5 -mr-1" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </PopoverClose>
                    </div>
                    <div className="text-sm font-medium">{listing.Event}</div>
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
