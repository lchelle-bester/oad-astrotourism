import {defineField, defineType} from 'sanity'
import {countries} from './countries.mjs'
import {initiativeTypes, initiativeOffers, sustainabilityAnswers, regions, continentOf, continents} from './surveyOptions.mjs'

// One validated answer to the astrotourism initiatives survey (Phase 12, 27 Nov 2026, L'chelle: editors
// type in each response because responses get validated). The Global Survey Report page counts these.
//
// THIS IS A PUBLIC DATASET (anyone can read it), so a response holds ONLY the answers the page counts:
// the country, the type of initiative, what it offers and whether it can pay its own way. No name, no
// email, no phone number, no initiative or organisation name, no free text. The survey's own responses
// file has contact details: they never come here.
// The continent is worked out from the country (surveyOptions.mjs), so it can never disagree.

const countryList = [
  ...regions.map(({code, name}) => ({title: name, value: code})),
  ...countries.map(({code, name}) => ({title: name, value: code})),
]
const nameOf = (code) => countryList.find((c) => c.value === code)?.title ?? code
const continentTitle = (value) => continents.find((c) => c.value === value)?.title

export const surveyResponse = defineType({
  name: 'surveyResponse',
  title: 'Survey response',
  type: 'document',
  fields: [
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      description: 'Where the initiative is. If the respondent only said "Latin America", choose "Latin America (region)". The continent is worked out from this.',
      options: {list: countryList},
      validation: (Rule) => Rule.required().error('Choose the country.'),
    }),
    defineField({
      name: 'type',
      title: 'Type of initiative',
      type: 'string',
      description: 'The group the initiative chose for itself (the form asks "What category does your project best fit into?"). "Something else" is the form\'s "None of the above".',
      options: {list: initiativeTypes.map(({value, title}) => ({title, value})), layout: 'radio'},
      validation: (Rule) => Rule.required().error('Choose the type.'),
    }),
    defineField({
      name: 'offers',
      title: 'What it offers',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Choose everything the initiative offers. Leave empty if the respondent chose none.',
      options: {list: initiativeOffers.map(({value, title}) => ({title, value})), layout: 'grid'},
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'sustainability',
      title: 'Can it pay its own way?',
      type: 'string',
      description: 'Is the initiative financially self-sustaining? Choose "Did not say" if the question was left empty.',
      options: {list: sustainabilityAnswers.map(({value, title}) => ({title, value})), layout: 'radio'},
      validation: (Rule) => Rule.required().error('Choose an answer.'),
    }),
    defineField({
      name: 'importKey',
      title: 'Import key',
      type: 'string',
      description: 'Filled in by the import script, so importing the same response twice never makes a copy. Leave empty for a response typed in by hand.',
      readOnly: true,
    }),
  ],
  preview: {
    select: {country: 'country', type: 'type'},
    prepare: ({country, type}) => ({
      title: nameOf(country),
      subtitle: `${continentTitle(continentOf(country)) || 'Unknown continent'} · ${initiativeTypes.find((x) => x.value === type)?.title || type || 'no type'}`,
    }),
  },
  orderings: [
    {title: 'Country, A to Z', name: 'countryAsc', by: [{field: 'country', direction: 'asc'}]},
  ],
})
