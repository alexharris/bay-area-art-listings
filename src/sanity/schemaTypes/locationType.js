import {defineField, defineType} from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  components: {
    input: (props) => props.renderDefault({
      ...props,
      groups: props.groups?.filter(g => ['info', 'hours', 'archive'].includes(g.name)),
    }),
  },
  groups: [
    { name: 'info', title: 'Info', default: true },
    { name: 'hours', title: 'Hours' },
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
      name: 'GoogleID',
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
      name: 'Hours',
      type: 'object',
      group: 'hours',
      options: {
        collapsible: true,
        collapsed: true,
      },
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
      name: 'hoursLastSyncedAt',
      title: 'Hours Last Synced',
      type: 'datetime',
      readOnly: true,
      description: 'When hours were last fetched from Google.',
      group: 'hours',
    }),
    defineField({
      name: 'hoursPendingReview',
      title: 'Hours Changed — Needs Review',
      type: 'boolean',
      description: 'True when Google returned hours that differ from what was stored.',
      group: 'hours',
    }),
    defineField({
      name: 'hoursChangedAt',
      title: 'Hours Last Changed',
      type: 'datetime',
      readOnly: true,
      description: 'When hours were last detected as different from Google data.',
      group: 'hours',
    }),
    defineField({
      name: 'OriginalName',
      type: 'string',
      group: 'archive',
    }),
  ],
})
