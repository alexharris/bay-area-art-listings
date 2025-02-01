import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});


export default async function Location({ params }) {
  const id = (await params).id
  

  const locationData = await client.fetch(`*[_type == "location" && _id == $id][0]`, { id });
  const today = new Date().toISOString().split('T')[0];
  const listings = await client.fetch(`*[_type == "listing" && references($id) && StartDate <= $today && EndDate >= $today]`, { id, today });

  const hasListings = listings.length > 0;

 return (

  <div className="p-4 prose">
    <h1>{locationData.Name}</h1>
    <p>Address: {locationData.Address}</p>
    <p>Website: <a href={locationData.Url} target="_blank" rel="noopener noreferrer">{locationData.Url}</a></p>
    {locationData.Geolocation && (
      <p>Geolocation: {locationData.Geolocation.lat}, {locationData.Geolocation.lng}</p>
    )}
    <hr />
    {listings.length > 0 ? (
      <>
      <h2>Current Listings</h2>
      <ul>
        {listings.map((listing) => (
        <li key={listing._id}>
          <h3>{listing.Event}</h3>
          <div>{listing.StartDate} - {listing.EndDate}</div>        
          <p>{listing.Notes}</p>
        </li>
        ))}
      </ul>
      </>
    ) : (
      <p>No current listings available.</p>
    )}

  </div>

 )
}

// const LocationPage = () => {
//   const router = useRouter();
//   const { id } = router.query;
  
//   const [locationData, setLocationData] = useState(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined' && id) {
//       const fetchLocationData = async () => {
//         try {
//           const data = await client.fetch(`*[_type == "location" && _id == $id][0]`, { id });
//           setLocationData(data);
//         } catch (error) {
//           console.error('Data retrieval failed:', error);
//         }
//       };
//       fetchLocationData();
//     }
//   }, [id]);



//   return (

//   );
// };

// export default LocationPage;
