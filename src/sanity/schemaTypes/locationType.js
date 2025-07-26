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
      title: 'Instagram',
      name: 'Instagram',
      type: 'string'
    }),      
    defineField({
      name: 'Geolocation',
      type: 'geopoint',
      options: {
        collapsible: true, // Makes the whole fieldset collapsible
        collapsed: true, // Defines if the fieldset should be collapsed by default or not
      },      
    }),
    defineField({
      name: 'Hours',
      type: 'object',
      options: {
        collapsible: true, // Makes the whole fieldset collapsible
        collapsed: true, // Defines if the fieldset should be collapsed by default or not
      },      
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
    }),
    defineField({
      name: 'InternalNotes',
      type: 'string',
      description: 'Notes just for internal use, not displayed on the site.',
    }),         
  ],
})