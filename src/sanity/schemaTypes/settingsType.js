import {defineField, defineType} from 'sanity'

export const settingsType = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'topBar',
      title: 'Top Bar',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Top Bar',
          type: 'boolean',
          description: 'Toggle to show or hide the announcement bar',
          initialValue: false,
        }),
        defineField({
          name: 'text',
          title: 'Announcement Text',
          type: 'array',
          of: [{
            type: 'block',
            styles: [],
            lists: [],
            marks: {
              decorators: [
                {title: 'Strong', value: 'strong'},
                {title: 'Emphasis', value: 'em'},
              ],
              annotations: [
                {
                  name: 'link',
                  type: 'object',
                  title: 'URL',
                  fields: [
                    {
                      title: 'URL',
                      name: 'href',
                      type: 'url',
                      validation: Rule => Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel']
                      })
                    }
                  ]
                }
              ]
            }
          }],
          description: 'Text to display in the announcement bar. You can add links and basic formatting.',
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Background Color',
          type: 'string',
          options: {
            list: [
              {title: 'Green', value: 'green-300'},
              {title: 'Yellow', value: 'yellow-300'},
              {title: 'Orange', value: 'orange-200'},
              {title: 'Red', value: 'red-300'},
              {title: 'Blue', value: 'blue-200'},
            ],
          },
          initialValue: 'green-300',
        }),
      ],
    }),
    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Dialog Title',
          type: 'string',
          description: 'Title displayed in the newsletter signup dialog',
          initialValue: 'Subscribe to Newsletter',
        }),
        defineField({
          name: 'description',
          title: 'Description Text',
          type: 'text',
          rows: 3,
          description: 'Description text shown above the email input field',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
