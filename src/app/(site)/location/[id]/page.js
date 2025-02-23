import { createClient } from '@sanity/client';
import MapComponent from './MapComponent';


const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function Location({ params }) {
  const id = (await params).id;
  const locationData = await client.fetch(`*[_type == "location" && _id == $id][0]`, { id });
  const today = new Date().toISOString().split('T')[0];
  const upcomingListings = await client.fetch(`*[_type == "listing" && references($id) && StartDate >= $today]`, { id, today });
  const currentListings = await client.fetch(`*[_type == "listing" && references($id) && StartDate <= $today && EndDate >= $today]`, { id, today });
  const pastListings = await client.fetch(`*[_type == "listing" && references($id) && EndDate <= $today]`, { id, today });
  console.log(locationData)
  return (
    <div className="p-4 prose">
      <h1>{locationData.Name}</h1>
      <p>Address: {locationData.Address}</p>
      {locationData.Hours && (
        <div>
          <h2>Hours, According to Google</h2>
          <ul>
            {Object.keys(locationData.Hours).map((day) => (
              <li key={day}>
                <strong>{day}:</strong> {locationData.Hours[day]}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>Website: <a href={locationData.Url} target="_blank" rel="noopener noreferrer">{locationData.Url}</a></p>
      {locationData.Geolocation && (
        <p>Geolocation: {locationData.Geolocation.lat}, {locationData.Geolocation.lng}</p>
      )}
      {locationData.Geolocation && <MapComponent geolocation={locationData.Geolocation} />}
      <hr />
      {upcomingListings.length > 0 ? (
        <>
          <h2>Upcoming Listings</h2>
          <ul>
            {upcomingListings.map((listing) => (
              <li key={listing._id}>
                <h3>{listing.Event}</h3>
                <div>{listing.StartDate} - {listing.EndDate}</div>        
                <p>{listing.Notes}</p>
              </li>
            ))}
          </ul>
          <hr />
        </>
      ) : (
        <></>
      )}
      
      {currentListings.length > 0 ? (
        <>
          <h2>Current Listings</h2>
          <ul>
            {currentListings.map((listing) => (
              <li key={listing._id}>
                <h3>{listing.Event}</h3>
                <div>{listing.StartDate} - {listing.EndDate}</div>        
                <p>{listing.Notes}</p>
              </li>
            ))}
          </ul>
          <hr />
        </>
      ) : (
        <></>
      )}
      {pastListings.length > 0 ? (
        <>
          <h2>Past Listings</h2>
          <ul>
            {pastListings.map((listing) => (
              <li key={listing._id}>
                <h3>{listing.Event}</h3>
                <div>{listing.StartDate} - {listing.EndDate}</div>        
                <p>{listing.Notes}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

