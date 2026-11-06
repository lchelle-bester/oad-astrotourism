// Turns a post's article (Sanity's "Portable Text", a list of blocks) into HTML.
// Our own small renderer, no dependency (decided 6 Nov 2026), so every tag in the
// output is written by this file. Every piece of text from Sanity goes through
// escapeHtml and every link address through a check, and a block type this file
// does not know is skipped, never printed.
//
// Step d of Phase 7 handles the text blocks: paragraphs (the first one is the
// lead), subheadings, quotes, bulleted and numbered lists, bold, italic and
// links. Photos, rows of photos, buttons, YouTube and Spotify come in the next
// steps; until then they are skipped and counted (the build prints how many).

const HEADINGS = {h2: 'h2', h3: 'h3', h4: 'h3', h5: 'h3', h6: 'h3'} // the post title is the h1; deeper levels map to h3

// A link from Sanity is used only if it is a page of this site (starts with one
// slash) or a full https, http or mailto address. Anything else is dropped and
// the words stay as plain text.
function safeLink(value, safeUrl) {
  const text = String(value || '').trim()
  if (/^\/(?!\/)/.test(text)) return text
  return safeUrl(text, ['https:', 'http:', 'mailto:'])
}

// The words of a block with nothing around them (for the search description
// and the reading time)
function plainText(block) {
  return (block.children || []).filter((c) => c._type === 'span').map((c) => c.text || '').join('')
}

// One block's spans as HTML: text escaped, line breaks kept, bold and italic as
// <strong> and <em>, links as <a> (outermost).
function renderSpans(block, h) {
  const defs = new Map((block.markDefs || []).map((d) => [d._key, d]))
  return (block.children || []).map((child) => {
    if (child._type !== 'span') return '' // an inline object this renderer does not know
    let html = h.escapeHtml(child.text || '').replace(/\n/g, '<br>')
    const marks = child.marks || []
    if (marks.includes('strong')) html = `<strong>${html}</strong>`
    if (marks.includes('em')) html = `<em>${html}</em>`
    for (const mark of marks) {
      const def = defs.get(mark)
      if (def && def._type === 'link') {
        const href = safeLink(def.href, h.safeUrl)
        if (href) html = `<a href="${h.escapeHtml(href)}">${html}</a>`
      }
    }
    return html
  }).join('')
}

// body: the post's blocks. h: {escapeHtml, safeUrl}.
// Returns {html, skipped, text}: the HTML, a count of skipped block types, and
// the plain text of every text block (in order).
function renderPortableText(body, h) {
  const out = []
  const skipped = {}
  const text = []
  const lists = [] // the lists that are open, outermost first: 'ul' or 'ol'
  let lead = true // the first paragraph of the article is the lead, wherever it comes

  const closeList = () => out.push(`</li></${lists.pop()}>`)

  for (const block of body || []) {
    if (!block || block._type !== 'block') {
      while (lists.length) closeList()
      const type = (block && block._type) || 'unknown'
      skipped[type] = (skipped[type] || 0) + 1
      continue
    }
    const words = plainText(block).trim()
    const hasInline = (block.children || []).some((c) => c._type !== 'span')
    if (!words && !hasInline) continue // an empty paragraph
    text.push(words)

    if (block.listItem) {
      const tag = block.listItem === 'number' ? 'ol' : 'ul'
      const level = Math.max(1, Number(block.level) || 1)
      while (lists.length > level) closeList()
      if (lists.length === level && lists[lists.length - 1] !== tag) closeList()
      if (lists.length === level) out.push('</li>')
      while (lists.length < level) {
        out.push(`<${tag}>`)
        lists.push(tag)
      }
      out.push(`<li>${renderSpans(block, h)}`)
      continue
    }

    while (lists.length) closeList()
    const inner = renderSpans(block, h)
    const style = block.style || 'normal'
    if (style === 'blockquote') {
      out.push(`<blockquote><p>${inner}</p></blockquote>`)
    } else if (HEADINGS[style]) {
      out.push(`<${HEADINGS[style]}>${inner}</${HEADINGS[style]}>`)
    } else {
      out.push(lead ? `<p class="article__lead">${inner}</p>` : `<p>${inner}</p>`)
      lead = false
    }
  }
  while (lists.length) closeList()
  return {html: out.join('\n'), skipped, text}
}

// A search-engine description from the first paragraph (decided 6 Nov 2026):
// whitespace tidied, cut at a word boundary, 155 characters at most.
function describe(text) {
  const first = (text.find((t) => t) || '').replace(/\s+/g, ' ').trim()
  if (first.length <= 155) return first
  const cut = first.slice(0, 154)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:!?-]+$/, '') + '…'
}

module.exports = {renderPortableText, describe, plainText}
