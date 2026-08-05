'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import CalendarLink from '@/app/components/CalendarLink';
import TodaysHoursStatus from '@/app/components/TodaysHoursStatus';
import HoursPopup from '@/app/components/HoursPopup';
import { generateSlug, formatDate, cityFromAddress } from '@/utils/shared';

const client = createClient({
  projectId: 'ride9vgj',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: 'v2022-03-07'
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

export default function ShowPage() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        const data = await client.fetch(`
          *[_type == "listing"] {
            ...,
            _id,
            _createdAt,
            "locationName": Location->Name,
            "locationAddress": Location->Address,
            "locationCity": Location->City,
            "locationUrl": Location->Url,
            "locationGeolocation": Location->Geolocation,
            "locationHours": Location->Hours,
            "locationGoogleID": Location->GoogleID,
            "locationInstagram": Location->Instagram
          }
        `);

        const foundListing = data.find(item => generateSlug(item.Event) === params.slug);
        
        if (!foundListing) {
          setError('Show not found');
          setLoading(false);
          return;
        }

        let eventImageUrl = null;
        let eventImageCaption = null;
        
        if (foundListing.EventImageUpload) {
          eventImageUrl = urlFor(foundListing.EventImageUpload).width(800).height(800).fit('crop').url();
        } else if (foundListing.EventImageUrl) {
          eventImageUrl = foundListing.EventImageUrl;
          eventImageCaption = foundListing.EventImageCaption;
        }

        setListing({
          ...foundListing,
          eventImageUrl,
          eventImageCaption,
        });
        setLoading(false);
      } catch (err) {
        console.error('Data retrieval failed:', err);
        setError('Failed to load show details');
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchListing();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Show Not Found</h1>
          <p className="text-gray-600 mb-6">The exhibition you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
          >
            Back home
          </a>
        </div>
      </div>
    );
  }

  const startDate = listing.StartDate ? formatDate(listing.StartDate) : '';
  const endDate = listing.EndDate ? formatDate(listing.EndDate) : '';
  const dateDisplay = listing.DateOverride || (startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <a href="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </a>

        {/* Event Image */}
        {listing.eventImageUrl && (
          <div className="mb-8">
            {listing.eventImageUrl.includes('cdn.sanity.io') ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={listing.eventImageUrl}
                  alt={listing.eventImageCaption || listing.Event}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
            ) : (
              <img
                src={listing.eventImageUrl}
                alt={listing.eventImageCaption || listing.Event}
                className="w-full h-auto object-contain"
              />
            )}
            {listing.eventImageCaption && (
              <p className="text-sm text-gray-600 mt-2">{listing.eventImageCaption}</p>
            )}
          </div>
        )}
        <div className="flex flex-row">
            <div className="w-2/3">
                {/* Event Title */}
                <h1 className="text-2xl md:text-3xl mb-4">{listing.Event}</h1>
                
                {/* Date */}
                {dateDisplay && (
                <div className="mb-4">
                    <p className="text-xl">{dateDisplay}</p>
                </div>
                )}

                {/* Notes */}
                {listing.Notes && (
                <div className="mb-6">
                    <div className="max-w-none whitespace-pre-wrap text-xl">
                        {typeof listing.Notes === 'string' 
                        ? listing.Notes.replace(/\+\+\+/g, '') 
                        : Array.isArray(listing.Notes)
                            ? listing.Notes
                                .filter(block => block._type === 'block')
                                .map(block => 
                                block.children
                                    ? block.children.map(child => child.text).join('')
                                    : ''
                                )
                                .join('\n')
                                .replace(/\+\+\+/g, '')
                            : String(listing.Notes).replace(/\+\+\+/g, '')
                        }
                    </div>
                </div>
                )}
            </div>
            <div className="w-1/3 border border-gray-300 p-4 rounded">
                {/* Location Information */}
                <div className="mb-6">
                {listing.locationName && (
                    <div className="mb-2">
                    {listing.locationUrl ? (
                        <a 
                        href={listing.locationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xl hover:underline"
                        >
                        {listing.locationName}
                        </a>
                    ) : (
                        <p className="text-xl">{listing.locationName}</p>
                    )}
                    </div>
                )}
                
                {(listing.locationCity || listing.locationAddress) && (
                    <p className="text-gray-600">{listing.locationCity || cityFromAddress(listing.locationAddress)}</p>
                )}

                {listing.locationAddress && (
                    <p className="text-gray-600">{listing.locationAddress}</p>
                )}


                {listing.locationInstagram && (
                    <a 
                    href={`https://instagram.com/${listing.locationInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:underline"
                    >
                    @{listing.locationInstagram.replace('@', '')}
                    </a>
                )}
                </div>

                {/* Hours */}
                {listing.locationHours && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Hours</h2>
                    <TodaysHoursStatus locationHours={listing.locationHours} locationUrl={listing.locationUrl} />
                    <HoursPopup locationName={listing.locationName} locationHours={listing.locationHours} locationUrl={listing.locationUrl}>
                    <button className="text-blue-600 hover:underline mt-2">View all hours</button>
                    </HoursPopup>
                </div>
                )}

            {/* Event URL */}
            {listing.EventUrl && (
            <div className="mb-6">
                <a
                href={listing.EventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                Visit event page
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                </a>
            </div>
            )}

            {/* Calendar Link */}
            {listing.StartDate && (
            <div className="mb-6">
                <CalendarLink 
                listing={{
                    Event: listing.Event,
                    StartDate: listing.StartDate,
                    EndDate: listing.EndDate,
                    locationName: listing.locationName,
                    locationAddress: listing.locationAddress,
                    EventUrl: listing.EventUrl
                }}
                />
            </div>
            )}                

            </div>



        </div>

       
      </div>
    </div>
  );
}
