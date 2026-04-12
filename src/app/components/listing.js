import { useState } from 'react';
import Image from 'next/image';
import CalendarLink from './CalendarLink';
import NotesRenderer from './NotesRenderer';
import DateNote from './DateNote';
import HoursPopup from './HoursPopup';
import CityFromPlaceId from './CityFromPlaceId';
import { Badge } from '@/components/ui/badge';
import { generateSlug, getTodayName } from '../../utils/shared';

export default function Listings({
  listings,
  formatDate,
  onViewToday,
  setOnViewToday,
  endingSoonOnly,
  setEndingSoonOnly,
  openingTodayOnly,
  setOpeningTodayOnly
}) {
  const [showDetails, setShowDetails] = useState({});
  const [venueOpen, setVenueOpen] = useState({});

  const shouldShowOpenToday = (item) => item.isOnViewToday === true;

  const renderVenueCard = (item, index) => {
    if (item.locationName.toLowerCase() === 'various') {
      return (
        <div className="bg-gray-50 rounded p-3">
          {item.eventUrl
            ? <a href={item.eventUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-sm">{item.locationName}</a>
            : <span className="font-medium text-sm">{item.locationName}</span>
          }
        </div>
      );
    }

    const todayName = getTodayName();
    const rawHours = item.locationHours?.[todayName];
    const todayHours = rawHours
      ? rawHours.replace(`${todayName}: `, '').replace(`${todayName}:`, '').trim()
      : null;
    const isClosed = todayHours?.toLowerCase().includes('closed');
    const isOpen = todayHours && !isClosed;

    const mapsUrl = item.googlePlaceId
      ? `https://www.google.com/maps/place/?q=place_id:${item.googlePlaceId}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName + ' ' + item.locationAddress)}`;

    return (
      <div className="bg-gray-50 rounded p-3 flex gap-2 text-sm text-gray-600">
        {/* Pin icon */}
        <span className="text-base leading-snug flex-shrink-0">📍</span>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900">
            {item.locationName}
          </a>
          <CityFromPlaceId googlePlaceId={item.googlePlaceId} fallbackAddress={item.locationAddress} />
          {todayHours ? (
            <HoursPopup locationName={item.locationName} locationHours={item.locationHours} locationUrl={item.locationUrl}>
              <button className="flex items-center gap-1 cursor-pointer underline w-fit">
                Today: {isClosed ? 'Closed' : todayHours}
              </button>
            </HoursPopup>
          ) : !item.locationHours ? (
            <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className="underline">Check hours</a>
          ) : null}
          <div className="flex items-center gap-3 mt-0.5">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Directions
            </a>
            {item.locationInstagram && (
              <a
                href={`https://instagram.com/${item.locationInstagram.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOpenings = (item) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const upcoming = item.openings
      ?.filter(o => o.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date)) || [];
    if (!upcoming.length) return null;
    return (
      <div className="flex flex-col gap-1 mt-1">
        {upcoming.map((opening, idx) => {
          const isToday = opening.date === today;
          return (
          <div key={opening._key || idx} className="text-sm border-b border-dashed border-gray-100 pb-1.5 last:border-0 last:pb-0">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${isToday ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <span className="font-medium">{opening.title}</span>
              </div>
              <div className="text-gray-700">
                <CalendarLink
                  dateLabel={`${new Date(opening.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}${opening.time ? ` • ${opening.time}` : ''}`}
                  singleEvent={{
                    title: opening.title,
                    date: opening.date,
                    time: opening.time,
                    locationName: item.locationName,
                  }}
                />
              </div>
            </div>
            {opening.note && <div className="text-gray-600">{opening.note}</div>}
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <ul id="list-view" className="w-full px-3 md:p-2 lg:px-4">
      {listings.map((item, index) => (
        <li className="border-b min-h-40 border-dashed border-gray-400 py-5 w-full relative flex flex-col md:flex-row justify-between gap-4" key={item._id || index}>

          {/* Left Column - Title + image + (notes on desktop) */}
          <div className="flex flex-col md:flex-row lg:flex-row gap-4 w-full md:w-1/2 lg:w-2/3 xl:w-1/2">

            {/* Desktop gallery well — hidden on mobile */}
            {item.eventImageUrl && (
              <div className="hidden md:flex flex-col flex-shrink-0 gap-1.5">
                <div className="relative w-36 h-36 bg-gray-100 rounded overflow-hidden">
                  {item.eventImageUrl.includes('cdn.sanity.io') ? (
                    <Image
                      src={item.eventImageUrl}
                      alt={item.eventImageCaption || item.Event}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <img
                      src={item.eventImageUrl}
                      alt={item.eventImageCaption || item.Event}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {item.eventImageCaption && (
                  <p className="text-xs text-gray-400 w-36 leading-snug">{item.eventImageCaption}</p>
                )}
              </div>
            )}

            <div className="flex flex-col flex-1">
              {/* Mobile gallery well — above title on mobile */}
              {item.eventImageUrl && (
                <div className="md:hidden w-full bg-gray-100 rounded overflow-hidden mb-3">
                  <div className="relative w-full aspect-[4/3]">
                    {item.eventImageUrl.includes('cdn.sanity.io') ? (
                      <Image
                        src={item.eventImageUrl}
                        alt={item.eventImageCaption || item.Event}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 0px"
                      />
                    ) : (
                      <img
                        src={item.eventImageUrl}
                        alt={item.eventImageCaption || item.Event}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {item.eventImageCaption && (
                    <p className="text-xs text-gray-400 px-2.5 py-2 leading-snug">{item.eventImageCaption}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="md:-mt-1 mb-2">
                {item.EventUrl
                  ? <a
                      href={item.EventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl lg:text-3xl"
                    >
                      <h2>{item.Event}<svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1 w-4 h-4 lg:w-5 lg:h-5 align-baseline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></h2>
                    </a>
                  : <span className="text-2xl lg:text-3xl">
                      <h2>{item.Event}</h2>
                    </span>
                }
              </div>

              {/* Date */}
              <div className="font-semibold mb-1">
                <CalendarLink listing={item} location="" dateLabel={item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`} />
              </div>

              {/* Notes — desktop only */}
              <div className="hidden md:flex flex-col gap-2">
                <NotesRenderer notes={item.Notes} itemIndex={index} />
              </div>
            </div>
          </div>

          {/* Right Side Container - Subevents and Location */}
          <div className="hidden md:flex md:flex-row lg:flex-col xl:flex-row items-start gap-2 lg:gap-4 md:w-1/2 lg:w-1/3 xl:w-1/2">

            {/* Badges + subevents — desktop only, always reserve space */}
            <div className="hidden md:flex flex-col gap-2 w-full">
              {renderOpenings(item) && (
                <>
                  <div className="text-xs uppercase tracking-wider text-gray-400">Events</div>
                  {renderOpenings(item)}
                </>
              )}
              {(shouldShowOpenToday(item) || item.StartDate || item.EndDate) && (
                <div className="flex flex-row flex-wrap gap-2">
                  <DateNote
                    startDate={item.StartDate}
                    endDate={item.EndDate}
                    endingSoonOnly={endingSoonOnly}
                    setEndingSoonOnly={setEndingSoonOnly}
                    openingTodayOnly={openingTodayOnly}
                    setOpeningTodayOnly={setOpeningTodayOnly}
                  />
                  {shouldShowOpenToday(item) && (
                    <Badge
                      variant="outline"
                      className="!border-green-300 text-black hover:bg-green-50 cursor-pointer transition-colors"
                      onClick={() => setOnViewToday(!onViewToday)}
                    >
                      On View Today
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Venue section — desktop only (mobile renders at bottom of li) */}
            <div className="hidden md:block w-full">
              {renderVenueCard(item, index)}
            </div>

          </div>

          {/* Notes + badges + openings — mobile only */}
          <div className="md:hidden flex flex-col gap-2">
            <div className="flex flex-row flex-wrap gap-2">
              <DateNote
                startDate={item.StartDate}
                endDate={item.EndDate}
                endingSoonOnly={endingSoonOnly}
                setEndingSoonOnly={setEndingSoonOnly}
                openingTodayOnly={openingTodayOnly}
                setOpeningTodayOnly={setOpeningTodayOnly}
              />
              {shouldShowOpenToday(item) && (
                <Badge
                  variant="outline"
                  className="!border-green-300 text-black hover:bg-green-50 cursor-pointer transition-colors"
                  onClick={() => setOnViewToday(!onViewToday)}
                >
                  On View Today
                </Badge>
              )}
            </div>
            <NotesRenderer notes={item.Notes} itemIndex={index} />
            {renderOpenings(item)}
          </div>

          {/* Venue card — mobile only, at bottom */}
          <div className="md:hidden">
            {renderVenueCard(item, index)}
          </div>

          {showDetails[index] && (
            <div className="border-t border-dashed border-gray-100 mt-2">
              <div className="prose">
                <a
                  className="underline flex flex-row gap-1 items-center"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {item.locationAddress}
                </a>

                <a className="underline flex flex-row gap-1 items-center"
                  href={item.locationUrl}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {item.locationUrl}
                </a>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
