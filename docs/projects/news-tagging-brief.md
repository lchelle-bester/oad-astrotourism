# Brief: tag the OAD projects news posts with their projects

Hand this file, `news-project-matches.json` and `studio/schemaTypes/post.js` to the Claude that will make the changes. It is written so that Claude can work from it alone.

## The job

The Sanity project `gwz91d96`, dataset `production`, has 27 news posts in the category `oad-projects` and 20 project documents. Each post can now say which projects it is about, in a field called `projects`. `news-project-matches.json` lists, for each of the 27 posts, which project or projects to add. Your job is to write that field on the posts, and nothing else.

## The schema (studio/schemaTypes/post.js)

The new field on the `post` document type, as it is in the Studio:

```js
defineField({
  name: 'projects',
  title: 'Projects this post is about',
  type: 'array',
  hidden: ({document}) => document?.category !== 'oad-projects',
  of: [defineArrayMember({type: 'reference', to: [{type: 'project'}], weak: true})],
  validation: (Rule) => Rule.unique(),
})
```

So on a post document the data looks like this. Each item needs its own unique `_key`, and `_weak: true` because the references are weak:

```json
"projects": [
  {"_key": "m1", "_type": "reference", "_ref": "project-langkawians-guide-malaysians-to-the-stars", "_weak": true}
]
```

Other facts you need:

- A `post` has `title`, `slug`, `publishedAt` (a date), `category` (`news`, `events` or `oad-projects`), `mainImage`, `body` and now `projects`.
- A `project` has `title`, `slug`, `year`, `countries`, `place`, `summary`, `photo`, `cardColour`, `sdgs`, `tags` and `originalUrl`. Its `_id` is `project-` plus its slug, for example `project-anga-explorers-for-development`.
- Published documents have no `drafts.` prefix. A document someone is editing in the Studio also has a `drafts.<id>` copy.
- The dataset is public to read. Writing needs a token.

## What the list file contains

`news-project-matches.json` has one entry per post, newest first: `postId`, `postTitle`, `confidence`, `projectIds` and `projectTitles`.

`confidence` is one of `certain`, `high`, `medium`, `unsure` or `none`. Entries with `unsure` or `none` have an empty `projectIds` list: never tag those. Only touch the posts whose confidence levels L'chelle names when she gives you the job. The suggested first pass is `certain` and `high`, which is 16 posts. `medium` is another 6 posts and L'chelle may want to check those first.

## Rules (please follow every one)

1. **Dry run first.** Print exactly what you would write for each post (post title, the project titles) and stop. Write nothing until L'chelle says to go ahead.
2. **Never put a token in a file, a commit or the chat.** Read it from the `SANITY_TOKEN` environment variable or from a `.env` file in the repo, which is git-ignored. The repo is public.
3. **Change only the `projects` field,** with `set`, on documents listed in the file. Do not touch any other field, any other post, or any project document.
4. **Check the posts first.** Fetch each `postId` and confirm that it exists, that its `title` matches the file, and that its `category` is `oad-projects`. If any check fails, stop and report; do not guess.
5. **Skip any post that has a draft.** If `drafts.<postId>` exists, someone is editing that post. Writing to the published copy would be undone when they publish. Report those posts and leave them alone.
6. **Do not overwrite.** If a post already has a non-empty `projects` list that differs from the file, report it and skip it. If it already matches, skip it silently.
7. **Check each project id exists** as a published `project` document before referencing it.
8. **Write one post at a time,** not as one big transaction, so a failure leaves a clear record of what was done. Print each result.
9. **Verify afterwards** with a GROQ query that lists each tagged post's title and its project titles, and compare it with the file.

## How to get a token (L'chelle does this, not Claude)

1. Open https://www.sanity.io/manage, choose the project, then API, then Tokens, then Add API token.
2. Name it for example "news tagging", and give it the **Editor** role.
3. Copy it once into `.env` as `SANITY_TOKEN=...` (never into the chat).
4. **When the job is done, delete the token** in the same place.

## Afterwards

Run `node build/build.js`. It prints a line like `news linked to projects: 16 links on 9 project pages`. For the first pass (certain and high) the expected numbers are 16 links on 9 project pages. If `medium` is included as well: 22 links on 10 project pages. Then check one project page in the browser, for example the Himalayan one, and one article.

## Two things to tell L'chelle if they come up

- The two Tanzania projects, `project-astro-tourism-development-in-tanzania` and `project-astro-tourism-development-tanzania`, have identical summary text. The list uses the 2022 one for post 21. Do not add the other.
- The four Astrostays posts are deliberately untagged, pending Joy's answer.
