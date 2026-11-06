'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {DownloadIcon} from '@sanity/icons'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {ListingEvents} from './src/sanity/components/ListingEvents'
import {ImportTool} from './src/sanity/tools/ImportTool'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    ...schema,
    // Lets the exhibition's "Events" tab create an event with the exhibition pre-linked
    templates: (prev) => [
      ...prev,
      {
        id: 'event-for-listing',
        title: 'Event for exhibition',
        schemaType: 'event',
        parameters: [{name: 'listingId', type: 'string'}],
        value: ({listingId}) => ({listing: {_type: 'reference', _ref: listingId, _weak: true}}),
      },
    ],
  },
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode: (S, {schemaType}) =>
        schemaType === 'listing'
          ? S.document().views([S.view.form(), S.view.component(ListingEvents).title('Events')])
          : S.document().views([S.view.form()]),
    }),
    visionTool({defaultApiVersion: apiVersion}),
  ],
  tools: [
    {
      name: 'import-emails',
      title: 'Import Emails',
      icon: DownloadIcon,
      component: ImportTool,
    },
  ],
})
