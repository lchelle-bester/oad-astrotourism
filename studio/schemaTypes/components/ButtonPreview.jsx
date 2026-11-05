import {Box, Text} from '@sanity/ui'
import {buttonColours} from '../buttonColours'

// How a button looks inside the article in the Studio: a real coloured pill with
// its words, placed left, centre or right as chosen, and the place it goes to
// under it. The site's own look comes with the article pages.
export function ButtonPreview(props) {
  const {title, subtitle, colour, align} = props
  const style = buttonColours.find((c) => c.value === colour) || buttonColours[0]
  return (
    <Box padding={3}>
      <div style={{display: 'flex', justifyContent: {left: 'flex-start', center: 'center', right: 'flex-end'}[align] || 'flex-start'}}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.6em 1.4em',
            borderRadius: 999,
            border: '1px solid rgba(128,128,128,0.5)',
            background: style.hex,
            color: style.ink,
            fontWeight: 600,
          }}
        >
          {title || 'Button text'}
        </span>
      </div>
      <Box marginTop={2} style={{textAlign: {left: 'left', center: 'center', right: 'right'}[align] || 'left'}}>
        <Text size={1} muted>
          {subtitle ? `Goes to: ${subtitle}` : 'No link yet'}
        </Text>
      </Box>
    </Box>
  )
}
