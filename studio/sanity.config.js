import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Content types that only ever have one document
const singletonTypes = new Set(['hero', 'caseSection', 'pillarsSection', 'impactSection', 'siteSettings'])
// The only actions an editor gets on those documents (no delete, no duplicate)
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

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
            S.listItem()
              .title('The case')
              .id('caseSection')
              .child(S.document().schemaType('caseSection').documentId('caseSection')),
            S.listItem()
              .title('What we do (six pillars)')
              .id('pillarsSection')
              .child(S.document().schemaType('pillarsSection').documentId('pillarsSection')),
            S.listItem()
              .title('Impact (proof)')
              .id('impactSection')
              .child(S.document().schemaType('impactSection').documentId('impactSection')),
            S.divider(),
            S.listItem()
              .title('Site settings (footer)')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            // Every news post, newest first (two posts on the same date: the one
            // created later first)
            S.listItem()
              .title('News')
              .id('news')
              .child(
                S.documentTypeList('post')
                  .title('News')
                  .defaultOrdering([
                    {field: 'publishedAt', direction: 'desc'},
                    {field: '_createdAt', direction: 'desc'},
                  ]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hides single-document types from the "new document" menu
    templates: (templates) =>
      templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    // On single-document types, keep only the allowed actions
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && singletonActions.has(action))
        : input,
  },
})