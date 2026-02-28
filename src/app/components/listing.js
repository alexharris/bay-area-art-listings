import { useState } from 'react';
import Image from 'next/image';
import CalendarLink from './CalendarLink';
import NotesRenderer from './NotesRenderer';
import DateNote from './DateNote';
import HoursPopup from './HoursPopup';
import TodaysHoursStatus from './TodaysHoursStatus';
import CityFromPlaceId from './CityFromPlaceId';
import { Badge } from '@/components/ui/badge';
import { generateSlug } from '../../utils/shared';

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

  const renderVenueCard = (item, index, isMobile = false) => (
    <div className={`${isMobile ? '' : 'bg-gray-50 rounded p-4 mr-4'} flex flex-col justify-between`}>
      {item.locationName.toLowerCase() === 'various'
        ? <div className="flex flex-row font-semibold">
            {item.eventUrl
              ? <a href={item.eventUrl} target="_blank" rel="noopener noreferrer">{item.locationName}</a>
              : <span>{item.locationName}</span>
            }
          </div>
        : <>
            <div className="flex flex-row items-center gap-2 mb-1 lg:mb-0">
              {/* Mobile: name + inline chevron as toggle */}
              <button
                className="md:hidden flex items-center gap-1 font-semibold text-left"
                onClick={() => setVenueOpen(prev => ({ ...prev, [index]: !prev[index] }))}
                aria-label={venueOpen[index] ? 'Hide venue details' : 'Show venue details'}
              >
                {item.locationName}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {venueOpen[index] ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
              {/* Desktop: name as link */}
              <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className="hidden md:block font-semibold">
                {item.locationName}
              </a>
            </div>

            <div className={`${venueOpen[index] ? 'flex' : 'hidden'} md:flex flex-col gap-1`}>
              <div className="hidden md:block">
                <CityFromPlaceId googlePlaceId={item.googlePlaceId} fallbackAddress={item.locationAddress} />
              </div>
              <TodaysHoursStatus locationHours={item.locationHours} locationUrl={item.locationUrl} locationName={item.locationName} />
            </div>

            <div className={`${venueOpen[index] ? 'flex' : 'hidden'} md:flex flex-row items-center gap-2 mt-1`}>
              <a
                className="flex flex-row gap-1 items-center"
                href={item.googlePlaceId
                  ? `https://www.google.com/maps/place/?q=place_id:${item.googlePlaceId}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationName + ' ' + item.locationAddress)}`}
                target="_blank" rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-map-pin w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </a>
              <a className="underline flex flex-row gap-1 items-center" href={item.locationUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit venue website">
                <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-globe w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </a>
              <div>
                {item.locationHours ? (
                  <HoursPopup locationName={item.locationName} locationHours={item.locationHours} locationUrl={item.locationUrl}>
                    <button className="underline flex flex-row gap-1 items-center cursor-pointer" aria-label="View hours">
                      <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </button>
                  </HoursPopup>
                ) : (
                  <span className="flex flex-row gap-1 items-center" aria-label="Hours not available">
                    <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-clock w-6 lg:w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                )}
              </div>
              {item.locationInstagram && (
                <a
                  className="underline flex flex-row gap-1 items-center"
                  href={`https://instagram.com/${item.locationInstagram.replace(/^@/, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={`${item.locationName} on Instagram`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-instagram w-6 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
                  </svg>
                </a>
              )}
            </div>
          </>
      }
    </div>
  );

  const renderOpenings = (item) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const upcoming = item.openings
      ?.filter(o => o.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date)) || [];
    if (!upcoming.length) return null;
    return (
      <div className="flex flex-col gap-1 mt-1">
        {upcoming.map((opening, idx) => (
          <div key={opening._key || idx} className="text-sm">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1.5 flex-shrink-0"></span>
                <span className="font-medium">{opening.title}</span>
              </div>
              <div className="ml-3.5 text-gray-700">
                {new Date(opening.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                {opening.time && ` ${opening.time}`}
              </div>
            </div>
            {opening.note && <div className="text-gray-600 ml-3.5">{opening.note}</div>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <ul id="list-view" className="w-full px-3 md:p-2 lg:p-0">
      {listings.map((item, index) => (
        <li className="border-b min-h-40 border-dashed border-gray-400 pt-5 pb-6 w-full relative flex flex-col md:flex-row justify-between gap-2 lg:gap-4" key={item._id || index}>

          {/* Left Column - Title + image + (notes on desktop) */}
          <div className="flex flex-col md:flex-row lg:flex-row gap-3 w-full md:w-2/3">

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

            <div className="flex flex-col gap-2 flex-1">
              {/* Mobile gallery well — above title on mobile */}
              {item.eventImageUrl && (
                <div className="md:hidden w-full bg-gray-100 rounded overflow-hidden">
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
              <div>
                {item.EventUrl
                  ? <a
                      href={item.EventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl lg:text-3xl mb-2 lg:mb-0"
                    >
                      <h2>{item.Event}<svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1 w-4 h-4 lg:w-5 lg:h-5 align-baseline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></h2>
                    </a>
                  : <span className="text-2xl lg:text-3xl mb-2 lg:mb-0">
                      <h2>{item.Event}</h2>
                    </span>
                }
              </div>

              {/* Notes + openings — desktop only */}
              <div className="hidden md:flex flex-col">
                <NotesRenderer notes={item.Notes} itemIndex={index} />
                {renderOpenings(item)}
              </div>
            </div>
          </div>

          {/* Right Side Container - Date and Location */}
          <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-2 lg:gap-4 w-full md:w-auto lg:w-1/2">

            {/* Date section */}
            <div className="flex flex-col gap-2 w-full text-left items-start justify-start">
              <div className="font-semibold">
                <CalendarLink listing={item} location="" dateLabel={item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`} />
              </div>

              <div className="flex flex-row flex-wrap gap-2 items-start">
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
            </div>

            {/* Venue section — desktop only (mobile renders at bottom of li) */}
            <div className="hidden md:block w-full">
              {renderVenueCard(item, index)}
            </div>

          </div>

          {/* Notes + openings — mobile only */}
          <div className="md:hidden flex flex-col">
            <NotesRenderer notes={item.Notes} itemIndex={index} />
            {renderOpenings(item)}
          </div>

          {/* Venue card — mobile only, at bottom */}
          <div className="md:hidden">
            {renderVenueCard(item, index, true)}
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
