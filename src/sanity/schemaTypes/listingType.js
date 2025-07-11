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
      name: 'DateOverride',
      type: 'string',
      description: 'If filled, this will display instead of the date fields'
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
      description: 'Notes about the listing. Use +++ to separate preview and expanded text.',
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