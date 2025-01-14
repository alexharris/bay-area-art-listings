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
      name: 'Geolocation',
      type: 'geopoint',
    }),
  ],
})