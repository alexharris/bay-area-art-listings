import {defineField, defineType} from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'Header',
      type: 'string',
    }),    
    defineField({
      name: 'Content',
      type: 'array', 
      of: [
        {
          type: 'block'
        },
        {
          type: 'image'
        }        
      ]      
    }),
  ],
})