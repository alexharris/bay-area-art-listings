import {useDocumentOperation} from 'sanity'


export function HelloWorldAction(props) {
  const {patch, publish} = useDocumentOperation(props.id, props.type)

  return {
    
    label: 'Update From Google Places',
    icon: () => <span role="img" aria-label="Google Places">🌍</span>,
    onHandle: () => {
      // Get the GoogleID value from the current document
      const googleId = props.draft?.GoogleID || props.published?.GoogleID

      // Check if we have a GoogleID to work with
      if (!googleId) {
        console.error('No Google ID found in the document')
        return
      }

      // Fetch data from the the google-place api endpoint
      fetch('/api/google-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({placeId: googleId}),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error('Error fetching place data:', data.error)
            return
          }

          // Apply the fetched data to the document
          const {Name, Address, Url, Geolocation, Hours} = data.data

          const patches = [
            {setIfMissing: {_type: props.type}},
            {set: {Name}},
            {set: {Address}},
            {set: {Url}},
            {set: {Geolocation}}
          ]

          // Handle Hours as an object field
          if (Hours) {
            // Create separate patch operations for each day in Hours
            Object.entries(Hours).forEach(([day, value]) => {
              patches.push({set: {[`Hours.${day}`]: value}})
            })
          }

          patch.execute(patches)

        })
        .catch((error) => {
          console.error('Fetch error:', error)
        })

      

    },
  }
}