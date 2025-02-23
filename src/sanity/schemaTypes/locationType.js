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
      name: 'GoogleID',
      type: 'string',
    }),    
    defineField({
      name: 'OriginalName',
      type: 'string',
    }),      
    defineField({
      title: 'Website URL',
      name: 'Url',
      type: 'url'
    }),    
    defineField({
      name: 'Geolocation',
      type: 'geopoint',
    }),
    defineField({
      name: 'Hours',
      type: 'object',
      fields: [
        {
          name: 'Monday',
          type: 'string',
        },
        {
          name: 'Tuesday',
          type: 'string',
        },
        {
          name: 'Wednesday',
          type: 'string',
        },
        {
          name: 'Thursday',
          type: 'string',
        },
        {
          name: 'Friday',
          type: 'string',
        },
        {
          name: 'Saturday',
          type: 'string',
        },
        {
          name: 'Sunday',
          type: 'string',
        },
      ]
    })    
  ],
})