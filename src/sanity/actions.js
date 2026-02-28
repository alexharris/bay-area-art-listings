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

          // Get current stored hours to detect changes
          const currentHours = props.draft?.Hours || props.published?.Hours || {}

          const patches = [
            {setIfMissing: {_type: props.type}},
            {set: {Name}},
            {set: {Address}},
            {set: {Url}},
            {set: {Geolocation}},
            {set: {hoursLastSyncedAt: new Date().toISOString()}},
          ]

          // Handle Hours as an object field
          if (Hours) {
            // Detect if hours changed
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            const hoursChanged = days.some(day => currentHours[day] !== Hours[day])

            if (hoursChanged) {
              patches.push({set: {hoursPendingReview: true}})
              patches.push({set: {hoursChangedAt: new Date().toISOString()}})
            } else {
              patches.push({set: {hoursPendingReview: false}})
            }

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