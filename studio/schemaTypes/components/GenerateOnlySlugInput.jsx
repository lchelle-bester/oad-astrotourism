import {Button, Card, Stack, Text} from '@sanity/ui'
import {set, useFormValue} from 'sanity'

// The web address field for news posts (decided 29 Oct 2026): editors cannot
// type in it. While it is empty there is only a Generate button, which works
// once the title has some text. After that the address is shown, locked, so
// links to the post never break.

// Turns a title into an address: lower case, letters and numbers only, words
// joined by hyphens, at most 96 characters.
// "AstroDevSA Webinar, 30 June 2026" becomes "astrodevsa-webinar-30-june-2026".
function toSlug(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // removes accents: "é" becomes "e"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
}

export function GenerateOnlySlugInput(props) {
  const {value, onChange, readOnly} = props
  const title = useFormValue(['title'])
  const current = value?.current

  if (current) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1}>/news/{current}/</Text>
      </Card>
    )
  }

  const hasTitle = typeof title === 'string' && toSlug(title) !== ''
  return (
    <Stack space={3}>
      <Button
        text="Generate"
        mode="ghost"
        disabled={readOnly || !hasTitle}
        onClick={() => onChange(set({_type: 'slug', current: toSlug(title)}))}
      />
      {!hasTitle && (
        <Text size={1} muted>
          Write the title first.
        </Text>
      )}
    </Stack>
  )
}
