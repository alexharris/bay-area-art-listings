'use client';

import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'ride9vgj',
  dataset: 'production',
  token: 'skNjKTdtZLHyHrjFnNjL76asMf1OcDYvDYcsvEdLNjErzxN4HTDhBvYJl1QMoUXYGqleUZPMbz0z0BuVJyWV6aZuGcnQIw949ecUS9LMptAX6nCQajtEFT7MnlvNfQJ3kj3amgc1aTW9dqYTqgZ9zE8GcdhvRB4GRYrX12ZeMFvjRtA3Tthd',
  useCdn: false,
  apiVersion: 'v2022-03-07'
});

function deleteListings() {
  client.delete({
    query: `*[_type == "listing"]`
  })
}

function deleteLocations() {
  client.delete({
    query: `*[_type == "location"]`
  })
}

export default function deleteAllListings() {
  return (
    <div  className='border border-red-400 p-4 mt-48'>
      <p>WARNING - This will delete all listings</p>
      <button onClick={deleteListings} className='text-red-600 border border-black px-2 hover:bg-gray-300'>Delete All Listings</button>
      {/* <button onClick={deleteLocations} className='text-red-600 border border-black px-2 hover:bg-gray-300'>Delete All Locations</button> */}
    </div>    
  )
}