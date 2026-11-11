# Prompt: add each project's contact person

Give this whole file to the Claude that will do the job, together with `studio/schemaTypes/project.js` (the `contact` field is at the end of the fields list). It works from the prompt alone. This is a second, smaller pass: the page content and the goals of the 20 projects have already been written (see `docs/projects/scrape-prompt.md`, whose rule about leaving the contact out is now replaced by this file).

---

You are helping to fill in the content of a website for the IAU Office of Astronomy for Development (OAD) astrotourism programme. The site is built from a Sanity project (`gwz91d96`, dataset `production`, public to read; writing needs a token). It has 20 `project` documents. Each has an `originalUrl`, the address of OAD's own page for the project (for example https://astro4dev.org/astronomy-for-himalayan-livelihood-creation/).

## The job

OAD's project pages name a contact person, usually as "Contact" followed by a name, with the name linked to an email address (a `mailto:` link). Ram and Joy, who run OAD's website, agreed on 11 November 2026 that these contact details can be shown on the new site, because they are on OAD's pages already.

For each project, read its page at `originalUrl`, find the contact, and write it into the project's `contact` field, which is an object with two optional text fields:

```json
"contact": {"name": "Sonal Asgotraa", "email": "sonal@ghe.co.in"}
```

## What to copy and what not to

- **Copy only what the page shows.** The name exactly as written (keep any title such as Dr or Prof, and keep the spelling and accents). The email address exactly as in the `mailto:` link or as printed. Do not guess or construct an email address, do not look anyone up elsewhere, and do not copy anything from any other source.
- **Name:** the person's name without the word "Contact". For "Contact Areg Mickaelian" the name is "Areg Mickaelian".
- **Email:** only the address. Remove the `mailto:` prefix, and anything after a `?` (such as `?subject=...`). It must be a single, valid address.
- **Only a name, or only an email:** write what there is and leave the other out. If the page shows no contact at all, leave the project alone and say so in your report.
- **Phone numbers, postal addresses, social media links, job titles and organisations: do not copy.** Name and email only.
- **More than one contact on a page:** write the first one in `contact` and list the others in your report (name and email), so a person can decide. Do not combine them into one field.
- **Do not copy contacts from a project's text.** Only the labelled contact on the page counts. If the page text mentions a person's email in a sentence, that stays in the text where it is.

## What not to change

You write only the `contact` field, with `set`, on the 20 project documents. Do not touch any other field (`body`, `sdgs`, `summary`, `title` and so on), any other document, or any news post.

## How to work (rules)

1. **Read first, write nothing yet.** For every project, fetch the page and find the contact. Save what you found to `docs/projects/scraped-contacts.json` as an array of `{projectId, originalUrl, name, email, others, note}` and stop. Give me the report below. Do not write to Sanity until I say go.
2. **Be polite to the site.** One page at a time, at least two seconds between requests, and a generic client name (for example `OAD site content import`) in the User-Agent, never anyone's personal email.
3. **Never put a token in a file, a commit or the chat.** Read it from the `SANITY_TOKEN` environment variable or a `.env` file in the repository, which is git-ignored. The repository is public. I will create the token with the Editor role and delete it when you are done.
4. **Skip any project that has a draft.** If `drafts.<projectId>` exists, someone is editing it, and writing to the published copy would be undone when they publish. Report it and leave it alone.
5. **Do not overwrite.** If a project already has a `contact`, report it and skip it.
6. **Check before writing.** Each project id must be an existing published `project` document. Each email must match the pattern `something@something.something` with no spaces, quotes or angle brackets.
7. **Write one project at a time,** with `set`, and print the result for each.
8. **Verify afterwards** with a GROQ query that returns each project's `title`, `contact.name` and `contact.email`, and compare it with your report.

## The report I want (before any writing)

A table of the 20 projects: the page address, whether it loaded, the contact name and email you found (or "none on the page"), and any others you left out. Flag anything odd: a contact with no email, an email that does not look like a person's (for example a general info@ address), a contact that appears on several projects, and any page where you were not sure which person was the contact.

## After it is written

Run `node build/build.js` in the repository, then open one project page: the sidebar should show "Project contact" with the name as a link. If any email is rejected the build stops with a message naming the project: tell me which.
