import {defineField, defineType} from 'sanity'
import {EventImageUrlInput} from '../components/EventImageUrlInput'
import {EventUrlInput} from '../components/EventUrlInput'
import {StartDateInput} from '../components/StartDateInput'
import {EndDateInput} from '../components/EndDateInput'
import {GenerateInstagramButton} from '../components/GenerateInstagramButton'
import {CandidateImagesInput} from '../components/CandidateImagesInput'
import {ImportLinksInput} from '../components/ImportLinksInput'
import {ImportNotesInput} from '../components/ImportNotesInput'

export const listingType = defineType({
  name: 'listing',
  title: 'Listing',
  type: 'document',
  orderings: [
    {
      title: 'Last Modified',
      name: 'updatedAtDesc',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
    {
      title: 'Start Date, Newest',
      name: 'startDateDesc',
      by: [{ field: 'StartDate', direction: 'desc' }],
    },
    {
      title: 'Start Date, Oldest',
      name: 'startDateAsc',
      by: [{ field: 'StartDate', direction: 'asc' }],
    },
  ],
  fields: [
    defineField({
      name: 'Event',
      type: 'string',
    }),
    defineField({
      name: 'EventUrl',
      type: 'url',
      components: { input: EventUrlInput },
    }),
    defineField({
      name: 'importLinks',
      title: 'Candidate Links',
      type: 'array',
      of: [{ type: 'object', fields: [
        { name: 'text', type: 'string', title: 'Text' },
        { name: 'url', type: 'string', title: 'URL' },
      ]}],
      description: 'Auto-populated during email import. Click a link to open it.',
      components: { input: ImportLinksInput },
      hidden: ({ document }) => !document?.importLinks?.length,
    }),
    defineField({
      name: 'EventImageUpload',
      type: 'image',
      title: 'Event Image',
      description: 'Upload an image directly to Sanity (enables cropping, CDN serving). Takes priority over Event Image URL.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'EventImageUrl',
      type: 'url',
      title: 'Event Image URL (external)',
      description: 'Paste an external URL, then click "Import to Sanity" to ingest it as a managed asset.',
      components: {
        input: EventImageUrlInput,
      },
    }),
    defineField({
      name: 'candidateImageUrls',
      title: 'Candidate Images',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Auto-populated during email import. Click an image to set it as the Event Image URL.',
      components: { input: CandidateImagesInput },
    }),
    defineField({
      name: 'StartDate',
      type: 'date',
      options: {
        dateFormat: 'MMMM D, YYYY'
      },
      components: {
        input: StartDateInput,
      },
    }),
    defineField({
      name: 'EndDate',
      type: 'date',
      options: {
        dateFormat: 'MMMM D, YYYY'
      },
      components: {
        input: EndDateInput,
      },
    }),
    defineField({
      name: 'DateOverride',
      type: 'string',
      description: 'If filled, this will display instead of the date fields'
    }),
    defineField({
      name: 'Location',
      type: 'reference',
      to: [{type: 'location'}],
      weak: true,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'Notes',
      type: 'array',
      description: 'Notes about the listing. Use +++ to separate preview and expanded text.',
      of: [
        { type: 'block' },
        { type: 'image' },
      ]
    }),
    defineField({
      name: 'openings',
      title: 'Openings & Events',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
          defineField({ name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'MMMM D, YYYY' }, validation: Rule => Rule.required() }),
          defineField({ name: 'time', title: 'Time', type: 'string', description: 'e.g., "6-9pm"' }),
          defineField({ name: 'note', title: 'Note', type: 'string' }),
        ],
        preview: {
          select: { title: 'title', date: 'date', time: 'time' },
          prepare({ title, date, time }) {
            const d = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return { title: title || 'Untitled', subtitle: [d, time].filter(Boolean).join(' | ') };
          },
        },
      }],
    }),
    defineField({
      name: 'InternalNotes',
      type: 'string',
      description: 'Notes just for internal use, not displayed on the site.',
    }),
    defineField({
      name: 'includeInDigest',
      title: 'Include in Digest',
      type: 'boolean',
      description: 'Flag this show to appear in the next email digest.',
      initialValue: false,
    }),
    defineField({
      name: 'importNotes',
      title: 'Import Notes',
      type: 'text',
      rows: 8,
      description: 'Auto-populated during email import. Shows source info and Claude\'s reasoning.',
      components: { input: ImportNotesInput },
    }),
    defineField({
      name: 'emailMessageId',
      title: 'Email Message ID',
      type: 'string',
      hidden: true,
      description: 'Used to prevent duplicate imports.',
    }),
    defineField({
      name: 'instagramImage',
      type: 'image',
      title: 'Instagram Image',
      description: 'Auto-generated 4:5 portrait image for Instagram. Requires an Event Image to be set.',
      components: {
        input: GenerateInstagramButton,
      },
    }),
  ],
})
