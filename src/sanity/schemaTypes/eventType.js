import {defineField, defineType} from 'sanity'

// Any dated event: openings, closings and artist talks tied to an exhibition (set "Related
// Exhibition"), or standalone talks, workshops, fairs, parties (leave it empty).
// An event linked to an exhibition inherits that exhibition's venue unless it sets its own.
export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  orderings: [
    {title: 'Date, Soonest', name: 'dateAsc', by: [{field: 'date', direction: 'asc'}]},
    {title: 'Date, Latest', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', date: 'date', time: 'time', location: 'Location.Name', show: 'listing.Event'},
    prepare({title, date, time, location, show}) {
      const d = date
        ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
        : ''
      return {title: title || 'Untitled', subtitle: [d, time, location || show].filter(Boolean).join(' | ')}
    },
  },
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: {dateFormat: 'MMMM D, YYYY'},
      validation: Rule => Rule.required(),
    }),
    defineField({name: 'time', title: 'Time', type: 'string', description: 'e.g., "6-9pm"'}),
    defineField({
      name: 'Location',
      type: 'reference',
      to: [{type: 'location'}],
      weak: true,
      description: 'Optional if linked to an exhibition: the exhibition\'s venue is used.',
      validation: Rule =>
        Rule.custom((value, context) =>
          value || context.document?.listing ? true : 'Required unless the event is linked to an exhibition'
        ),
    }),
    defineField({name: 'url', title: 'URL', type: 'url'}),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Supports links: [link text](https://example.com)',
    }),
    defineField({
      name: 'listing',
      title: 'Related Exhibition',
      type: 'reference',
      to: [{type: 'listing'}],
      weak: true,
      description: 'Leave empty for a standalone event (not part of any exhibition).',
    }),
    defineField({name: 'InternalNotes', type: 'string', description: 'Not displayed on the site.'}),
  ],
})
