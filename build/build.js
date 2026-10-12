// Build script, step 1: fetch the hero from Sanity and print it.
// Later steps will fill the templates in site/ and write the result to dist/.

// Sanity project ID and dataset name are not secret (see CLAUDE.md).
const PROJECT_ID = 'gwz91d96'
const DATASET = 'production'
const API_VERSION = '2025-02-19'

// Runs a GROQ query against Sanity's public query API and returns the result.
async function sanityQuery(groq) {
  const url =
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(groq)}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Sanity returned ${response.status} ${response.statusText}`)
  }
  const body = await response.json()
  return body.result
}

async function main() {
  const hero = await sanityQuery('*[_id == "hero"][0]{headline, subheading, affiliation}')
  if (!hero) {
    throw new Error('No published hero document found in Sanity. Publish it in the Studio.')
  }
  console.log(hero)
}

main().catch((error) => {
  console.error('Build failed:', error.message)
  process.exit(1)
})
