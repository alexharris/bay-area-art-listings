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
      name: 'EventUrl',
      type: 'url'
    }),      
    defineField({
      name: 'StartDate',
      type: 'date',
      options: {
        dateFormat: 'MMMM D, YYYY'
      }      
    }),    
    defineField({
      name: 'EndDate',
      type: 'date',
      options: {
        dateFormat: 'MMMM D, YYYY'
      }
    }),    
    defineField({
      name: 'Highlight',
      type: 'boolean',
    }),
    defineField({
      name: 'Location',
      type: 'reference',
      to: [{type: 'location'}],
      weak: true,
    }),
    defineField({
      name: 'Notes',
      type: 'array', 
      of: [
        {
          type: 'block'
        },
        {
          type: 'image'
        }        
      ]      
    })
  ],
})