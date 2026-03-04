import {defineField, defineType} from 'sanity'
import {GoogleSyncPanel} from '../components/GoogleSyncPanel'

export const locationType = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  components: {
    input: (props) => props.renderDefault({
      ...props,
      groups: props.groups?.filter(g => ['info', 'hours', 'sync', 'archive'].includes(g.name)),
    }),
  },
  groups: [
    { name: 'info', title: 'Info', default: true },
    { name: 'hours', title: 'Hours' },
    { name: 'sync', title: 'Sync' },
    { name: 'archive', title: 'Archive' },
  ],
  fields: [
    defineField({
      name: 'Name',
      type: 'string',
      group: 'info',
    }),
    defineField({
      name: 'Address',
      type: 'string',
      group: 'info',
    }),
    defineField({
      title: 'Website URL',
      name: 'Url',
      type: 'url',
      group: 'info',
    }),
    defineField({
      title: 'Instagram',
      name: 'Instagram',
      type: 'string',
      group: 'info',
    }),
    defineField({
      name: 'Geolocation',
      type: 'geopoint',
      group: 'info',
    }),
    defineField({
      name: 'InternalNotes',
      type: 'string',
      description: 'Notes just for internal use, not displayed on the site.',
      group: 'info',
    }),
    defineField({
      name: 'hoursManualOverride',
      title: 'Manual Override',
      type: 'boolean',
      description: 'Check to prevent Google sync from overwriting name, address, or hours.',
      group: 'hours',
    }),
    defineField({
      name: 'Hours',
      type: 'object',
      group: 'hours',
      fields: [
        { name: 'Monday', type: 'string' },
        { name: 'Tuesday', type: 'string' },
        { name: 'Wednesday', type: 'string' },
        { name: 'Thursday', type: 'string' },
        { name: 'Friday', type: 'string' },
        { name: 'Saturday', type: 'string' },
        { name: 'Sunday', type: 'string' },
      ],
    }),
    defineField({
      name: 'GoogleID',
      title: 'Google Place ID',
      type: 'string',
      group: 'sync',
      description: 'Find this in Google Maps — search the venue, click Share, and copy the place ID from the link.',
      components: {input: GoogleSyncPanel},
    }),
    defineField({
      name: 'OriginalName',
      type: 'string',
      group: 'archive',
    }),
  ],
})
