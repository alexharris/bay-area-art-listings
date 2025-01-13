import {defineField, defineType} from 'sanity'

export const listingType = defineType({
  name: 'listing',
  title: 'Listing',
  type: 'document',
  fields: [
    defineField({
      name: 'Event',
      type: 'string',
    }),
    defineField({
      name: 'Artist',
      type: 'string',
    }),
    defineField({
      name: 'Start',
      type: 'string',
    }),
    defineField({
      name: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'End',
      type: 'string',
    }),
    defineField({
      name: 'Highlight',
      type: 'string',
    }),
    defineField({
      name: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'Notes',
      type: 'text',
    }),
    defineField({
      name: 'URL',
      type: 'url',
    }),
  ],
})