// The answers of the astrotourism initiatives survey, as the Global Survey Report page counts them
// (Phase 12, 27 Nov 2026; design in docs/survey-report/). One file, shared by the Studio, the build
// (build/survey.js) and the import script (studio/scripts/import-survey-responses.js), so the three
// can never disagree. Wording is from L'chelle's mock-up. A response stores the VALUE of each answer
// (the short code), so a title can be reworded here without touching the stored responses.

// The six groups of initiative: the answers to the form's single-choice question "What category does your
// project best fit into?" (Tourism Business, National Astrotourism Strategy, Observatory Facility, Passion
// Project, Planetarium, None of the above; "None of the above" is "Something else" here, as in the mock-up).
// Each initiative is in ONE group. `title` is the singular used in lists and charts, `plural` the wording
// used in the page's sentences ("Most initiatives are tourism businesses, followed by ...").
export const initiativeTypes = [
  {value: 'tourism-business', title: 'Tourism business', plural: 'tourism businesses'},
  {value: 'national-strategy', title: 'National astrotourism strategy', plural: 'national astrotourism strategies'},
  {value: 'observatory', title: 'Observatory', plural: 'observatories'},
  {value: 'passion-project', title: 'Passion project', plural: 'passion projects'},
  {value: 'planetarium', title: 'Planetarium', plural: 'planetariums'},
  {value: 'something-else', title: 'Something else', plural: 'other kinds of initiative'},
]

// What an initiative offers: the ten options of the form's "Key features" question (an initiative can tick
// several). `title` is the label of a bar, `short` the words used inside a sentence. The form's own wording,
// for the import script: Stargazing Tours, Cultural Astronomy Programs, Observatory Facilities (spelt
// "Facitilites" in the form), Astronomy Lectures or Talks, Camping or Glamping Experiences, Local Astronomy
// Festivals or Events, Light Pollution Mitigation Initiatives, Celestial Events (meteor showers; eclipses),
// Astrotourism Training, Astro-ecotourism Initiatives. "Observatory visits" is the mock-up's name for the
// Observatory Facilities option.
export const initiativeOffers = [
  {value: 'stargazing-tours', title: 'Stargazing tours', short: 'stargazing tours'},
  {value: 'astronomy-talks', title: 'Astronomy lectures or talks', short: 'astronomy talks'},
  {value: 'festivals-events', title: 'Local astronomy festivals or events', short: 'local astronomy festivals'},
  {value: 'light-pollution', title: 'Light pollution work', short: 'light pollution work'},
  {value: 'cultural-astronomy', title: 'Cultural astronomy', short: 'cultural astronomy'},
  {value: 'camping-glamping', title: 'Camping or glamping', short: 'camping or glamping'},
  {value: 'celestial-events', title: 'Celestial events, such as meteor showers and eclipses', short: 'celestial events'},
  {value: 'observatory-visits', title: 'Observatory visits', short: 'observatory visits'},
  {value: 'astro-ecotourism', title: 'Astro-ecotourism', short: 'astro-ecotourism'},
  {value: 'astrotourism-training', title: 'Astrotourism training', short: 'astrotourism training'},
]

// Can the initiative pay its own way? The form's three answers (Yes / No, but we hope to make it self-sustaining /
// No, we rely on external funding) and an empty answer, which the page calls "Did not say". `onTheWay` marks the
// two answers counted in the "on the way" share.
export const sustainabilityAnswers = [
  {value: 'yes', title: 'Yes, already self-sustaining', onTheWay: true},
  {value: 'hoping', title: 'Not yet, but hoping to be', onTheWay: true},
  {value: 'no', title: 'No, relies on outside funding', onTheWay: false},
  {value: 'not-said', title: 'Did not say', onTheWay: false},
]

// The six continents of the mock-up, with the colour of each in the charts and on the map. The seventh
// (Antarctica) has no answers and is not drawn.
export const continents = [
  {value: 'asia', title: 'Asia'},
  {value: 'south-america', title: 'South America'},
  {value: 'africa', title: 'Africa'},
  {value: 'north-america', title: 'North America'},
  {value: 'europe', title: 'Europe'},
  {value: 'oceania', title: 'Oceania'},
]

// One answer that is not a country: some respondents wrote "Latin America". It is stored with this code,
// counted in South America and not drawn on the map (there is no point to put it at).
export const REGION_LATIN_AMERICA = 'LATAM'
export const regions = [{code: REGION_LATIN_AMERICA, name: 'Latin America (region)', continent: 'south-america'}]

// Which continent each country is in, by ISO code, after the UN geoscheme with these conventions (checked
// against the mock-up: Mexico, the Dominican Republic and Nicaragua are North America; Iran, Iraq, Israel
// and Oman are Asia): the Caucasus countries, Cyprus and Turkey are counted in Asia, Russia in Europe,
// the Caribbean and Central America in North America, and the Pacific islands in Oceania. Antarctica and
// the sub-Antarctic territories are 'antarctica'. If a country is moved the survey page changes with it.
const byContinent = {
  africa: 'IO DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW',
  asia: 'AF AM AZ BH BD BT BN KH CN CY GE HK IN ID IR IQ IL JP JO KZ KW KG LA LB MO MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE',
  europe: 'AX AL AD AT BY BE BA BG HR CZ DK EE FO FI FR DE GI GR GG VA HU IS IE IM IT JE XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SJ SE CH UA GB',
  'north-america': 'AI AG AW BS BB BZ BM BQ VG CA KY CR CU CW DM DO SV GL GD GP GT HT HN JM MQ MX MS NI PA PR BL KN LC MF PM VC SX TT TC US VI',
  'south-america': 'AR BO BR CL CO EC FK GF GY PY PE SR UY VE',
  oceania: 'AS AU CK FJ PF GU KI MH FM NR NC NZ NU NF MP PW PG PN WS SB TK TO TV UM VU WF HM CC CX',
  antarctica: 'AQ BV TF GS',
}

export const continentOfCountry = Object.fromEntries(
  Object.entries(byContinent).flatMap(([continent, codes]) => codes.split(' ').map((code) => [code, continent])),
)

// The continent of a stored answer (a country code, or the Latin America region), or null if unknown
export const continentOf = (code) => (code === REGION_LATIN_AMERICA ? 'south-america' : continentOfCountry[code] ?? null)
