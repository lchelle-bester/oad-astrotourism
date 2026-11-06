import {Flex, Stack, Text} from '@sanity/ui'
import {set} from 'sanity'
import {buttonColours} from '../buttonColours.mjs'

// The colour field of an article button: the brand colours as real coloured
// circles with their names, the chosen one ringed. Click one to choose it.
// Each circle is a button, so it also works with the keyboard (Tab, Enter).
export function ButtonColourInput(props) {
  const {value, onChange, readOnly} = props
  return (
    <Flex gap={4} wrap="wrap">
      {buttonColours.map((colour) => {
        const chosen = value === colour.value
        return (
          <Stack key={colour.value} space={2} style={{textAlign: 'center'}}>
            <button
              type="button"
              disabled={readOnly}
              aria-pressed={chosen}
              aria-label={colour.title}
              title={colour.title}
              onClick={() => onChange(set(colour.value))}
              style={{
                width: 44,
                height: 44,
                margin: '0 auto',
                borderRadius: '50%',
                border: '1px solid rgba(128,128,128,0.6)',
                background: colour.hex,
                boxShadow: chosen ? '0 0 0 3px var(--card-bg-color, #fff), 0 0 0 6px #2276fc' : 'none',
                cursor: readOnly ? 'default' : 'pointer',
              }}
            />
            <Text size={1} weight={chosen ? 'semibold' : 'regular'}>
              {colour.title}
            </Text>
          </Stack>
        )
      })}
    </Flex>
  )
}
