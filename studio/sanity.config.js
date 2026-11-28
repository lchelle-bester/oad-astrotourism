import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Content types that only ever have one document
const singletonTypes = new Set(['hero', 'caseSection', 'pillarsSection', 'impactSection', 'impactPage', 'onlineCoursePage', 'surveyReportPage', 'siteSettings', 'theoryOfChange'])
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
            // The sections of the homepage, in the order they appear on the page. Each is
            // still its own document; this folder only groups them in the sidebar.
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(
                S.list()
                  .title('Homepage')
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
                      .title('What we do (four pillars)')
                      .id('pillarsSection')
                      .child(S.document().schemaType('pillarsSection').documentId('pillarsSection')),
                    S.listItem()
                      .title('Proof (impact figures)')
                      .id('impactSection')
                      .child(S.document().schemaType('impactSection').documentId('impactSection')),
                  ]),
              ),
            // Pages of their own, each with tabs inside
            S.listItem()
              .title('Pages')
              .id('pages')
              .child(
                S.list()
                  .title('Pages')
                  .items([
                    S.listItem()
                      .title('Impact page')
                      .id('impactPage')
                      .child(S.document().schemaType('impactPage').documentId('impactPage')),
                    S.listItem()
                      .title('Theory of Change page')
                      .id('theoryOfChange')
                      .child(S.document().schemaType('theoryOfChange').documentId('theoryOfChange')),
                    S.listItem()
                      .title('Online course page')
                      .id('onlineCoursePage')
                      .child(S.document().schemaType('onlineCoursePage').documentId('onlineCoursePage')),
                    S.listItem()
                      .title('Global Survey Report page')
                      .id('surveyReportPage')
                      .child(S.document().schemaType('surveyReportPage').documentId('surveyReportPage')),
                  ]),
              ),
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
            // Every validated survey response (anonymous: country and answers only), A to Z by country
            S.listItem()
              .title('Survey responses')
              .id('surveyResponses')
              .child(
                S.documentTypeList('surveyResponse')
                  .title('Survey responses')
                  .defaultOrdering([{field: 'country', direction: 'asc'}]),
              ),
            // Every project in the directory, newest year first, then A to Z
            S.listItem()
              .title('Projects')
              .id('projects')
              .child(
                S.documentTypeList('project')
                  .title('Projects')
                  .defaultOrdering([
                    {field: 'year', direction: 'desc'},
                    {field: 'title', direction: 'asc'},
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