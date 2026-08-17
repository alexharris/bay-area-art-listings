'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {DownloadIcon} from '@sanity/icons'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {ImportTool} from './src/sanity/tools/ImportTool'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
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
