import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'OAD Astrotourism',

  projectId: 'gwz91d96',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Hero')
              .id('hero')
              .child(S.document().schemaType('hero').documentId('hero')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})