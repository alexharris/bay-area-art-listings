import {defineField, defineType} from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    defineField({
      name: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'Address',
      type: 'string',
    }),
    defineField({
      title: 'URL',
      name: 'imageUrl',
      type: 'url',
      deprecated: {
        reason: 'Use the "Website URL" field instead.'
      },      
    }),
    defineField({
      title: 'Website URL',
      name: 'Url',
      type: 'url'
    }),    
    defineField({
      name: 'Geolocation',
      type: 'geopoint',
    })
  ],
})