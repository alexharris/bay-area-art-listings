import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CalendarLink from './CalendarLink';
import NotesRenderer from './NotesRenderer';
import DateNote from './DateNote';
import HoursPopup from './HoursPopup';
import FavoriteButton from './FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { generateSlug, getTodayName, cityFromAddress } from '../../utils/shared';
import { linkifyText } from '../../utils/linkifyText';

// Render the first listings up front (server HTML + hydration) and the rest in batches as the
// user scrolls near the bottom — keeps the initial HTML, DOM and hydration work small.
const INITIAL_RENDER_COUNT = 30;
const RENDER_BATCH_SIZE = 30;

export default function Listings({
  listings,
  formatDate,
  onViewToday,
  setOnViewToday,
  endingSoonOnly,
  setEndingSoonOnly,
  openingTodayOnly,
  setOpeningTodayOnly,
  highlightSlug,
  scrollTargetSlug,
}) {
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDER_COUNT);
  const sentinelRef = useRef(null);

  // Always render far enough to include a listing we're about to scroll to (share link / events view)
  const targetSlug = scrollTargetSlug || highlightSlug;
  const targetIndex = targetSlug ? listings.findIndex(item => generateSlug(item.Event) === targetSlug) : -1;
  const renderCount = Math.max(renderLimit, targetIndex + 1);
  const hasMore = renderCount < listings.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRenderLimit(limit => Math.max(limit, renderCount) + RENDER_BATCH_SIZE);
      },
      { rootMargin: '2000px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, renderCount]);

  const [copiedSlug, setCopiedSlug] = useState(null);
  const [tooltipSlug, setTooltipSlug] = useState(null);

  const handleShare = (item) => {
    const slug = generateSlug(item.Event);
    const url = `${window.location.origin}/s/${slug}`;
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1200);

    const showTooltip = () => {
      setTooltipSlug(slug);
      setTimeout(() => setTooltipSlug(null), 1200);
    };

    const copyToClipboard = () => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(showTooltip).catch(() => {});
      } else {
        try {
          const el = document.createElement('textarea');
          el.value = url;
          el.style.cssText = 'position:fixed;top:-9999px;opacity:0';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
          showTooltip();
        } catch {}
      }
    };

    if (navigator.share) {
      navigator.share({ title: item.Event, url }).catch((err) => {
        if (err.name !== 'AbortError') copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

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
          <span className="text-sm leading-tight">{item.locationCity || cityFromAddress(item.locationAddress)}</span>
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
              <div className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 mt-1.5 flex-shrink-0 ${isToday ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <span className="font-medium">{opening.title}</span>
              </div>
              <div className="text-gray-700 pl-3.5">
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
            {opening.note && <div className="text-gray-600 pl-3.5">{linkifyText(opening.note)}</div>}
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <ul id="list-view" className="w-full px-3 md:p-2 lg:px-4">
      {listings.slice(0, renderCount).map((item, index) => {
        // First listings' image is the LCP element on phones — load it eagerly at high priority.
        const isLcpCandidate = index < 2;
        const openings = renderOpenings(item);
        return (
        <li
          id={generateSlug(item.Event)}
          className={`border-b min-h-40 border-dashed border-gray-400 py-5 w-full relative flex flex-col gap-2 md:flex-row md:gap-4 justify-between${highlightSlug && generateSlug(item.Event) === highlightSlug ? ' listing-highlight' : ''}`}
          key={item._id || index}
        >
          {/*
            Each piece renders once. On mobile the wrapper divs are `display: contents`, so the
            pieces become direct flex items of the <li> and are arranged with order-*; from md up
            the wrappers are real flex containers and DOM order applies (md:order-none).
            Mobile order: image, title, date, badges, notes, actions, openings, venue.
          */}

          {/* Left Column - image + title/date/notes/actions */}
          <div className="contents md:flex md:flex-row gap-4 w-full md:w-1/2 lg:w-2/3 xl:w-1/2">

            {/* Gallery well — full-width 4:3 on mobile, 144px square thumbnail on desktop */}
            {item.eventImageUrl && (
              <div className="order-1 md:order-none mb-1 md:mb-0 w-full md:w-36 flex flex-col flex-shrink-0 md:gap-1.5 bg-gray-100 md:bg-transparent rounded overflow-hidden md:overflow-visible">
                <div className="relative w-full aspect-[4/3] md:w-36 md:h-36 md:aspect-auto bg-gray-100 md:rounded overflow-hidden">
                  {item.eventImageUrl.includes('cdn.sanity.io') ? (
                    <Image
                      src={item.eventImageUrl}
                      alt={item.eventImageCaption || item.Event}
                      fill
                      className="object-cover"
                      // Sanity already serves a cropped 400px thumbnail; skip next/image's srcSet
                      unoptimized
                      priority={isLcpCandidate}
                      fetchPriority={isLcpCandidate ? 'high' : undefined}
                    />
                  ) : (
                    <img
                      src={item.eventImageUrl}
                      alt={item.eventImageCaption || item.Event}
                      className="w-full h-full object-cover"
                      loading={isLcpCandidate ? 'eager' : 'lazy'}
                      fetchPriority={isLcpCandidate ? 'high' : 'auto'}
                      decoding="async"
                    />
                  )}
                </div>
                {item.eventImageCaption && (
                  <p className="text-xs text-gray-400 px-2.5 py-2 md:p-0 md:w-36 leading-snug">{item.eventImageCaption}</p>
                )}
              </div>
            )}

            <div className="contents md:flex md:flex-col md:flex-1">
              {/* Title */}
              <div className="order-2 md:order-none md:-mt-1 md:mb-2">
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
              <div className="order-3 md:order-none font-semibold mb-3 md:mb-1">
                <CalendarLink listing={item} location="" dateLabel={item.DateOverride || `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`} />
              </div>

              {/* Notes */}
              <div className="order-5 md:order-none">
                <NotesRenderer notes={item.Notes} itemIndex={index} />
              </div>

              {/* Actions */}
              <div className="order-6 md:order-none flex items-center gap-1 md:mt-2">
                <FavoriteButton listingId={item._id} />
                <button
                  onClick={() => handleShare(item)}
                  aria-label="Share"
                  className={`pt-0 pb-1 px-1 -mt-2 relative ${copiedSlug === generateSlug(item.Event) ? 'share-icon-active' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tooltipSlug === generateSlug(item.Event) && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      Copied!
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side Container - openings/badges and venue */}
          <div className="contents md:flex md:flex-row lg:flex-col xl:flex-row items-start gap-2 lg:gap-4 md:w-1/2 lg:w-1/3 xl:w-1/2">

            <div className="contents md:flex md:flex-col gap-2 w-full">
              {openings && (
                <div className="order-7 md:order-none flex flex-col md:gap-2">
                  <div className="hidden md:block text-xs uppercase tracking-wider text-gray-400">Upcoming Events</div>
                  {openings}
                </div>
              )}
              {(shouldShowOpenToday(item) || item.StartDate || item.EndDate) && (
                <div className="order-4 md:order-none flex flex-row flex-wrap gap-2">
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

            {/* Venue */}
            <div className="order-8 md:order-none mt-2 md:mt-0 w-full">
              {renderVenueCard(item, index)}
            </div>

          </div>
        </li>
        );
      })}
      {hasMore && <li ref={sentinelRef} aria-hidden="true" className="h-px" />}
    </ul>
  );
}
