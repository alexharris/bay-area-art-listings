import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'ride9vgj',
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: 'v2022-03-07'
});

const query = `
*[_type == "listing"]{
  _id,
  "Address": null,
  "Artist": null
}._id
`;

client
  .fetch(query)
  .then(ids => {
    if (!ids.length) {
      console.log('No assets to delete')
      return true
    }
    console.log(ids)
  const transaction = client.transaction();

  ids.forEach(id => {
    transaction.patch(id, {
    unset: ['Address', 'Artist']
    });
  });

  transaction.commit()
    .then(() => {
    console.log('Address and Artist fields have been deleted from all listings.');
    })
    .catch(error => {
    console.error('Failed to delete Address and Artist fields:', error);
    });
  })


// const deleteAddressAndArtistFromListing = async () => {


//   try {
//     const listings = await client.fetch(query);
//     const transaction = client.transaction();

//     listings.forEach(listing => {
//       transaction.patch(listing._id, {
//         unset: ['Address', 'Artist']
//       });
//     });

//     await transaction.commit();
//     console.log('Address and Artist fields have been deleted from all listings.');
//   } catch (error) {
//     console.error('Failed to delete Address and Artist fields:', error);
//   }
// };

// deleteAddressAndArtistFromListing();