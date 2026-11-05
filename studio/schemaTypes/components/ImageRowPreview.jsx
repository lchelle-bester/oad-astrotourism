import {Box, Text} from '@sanity/ui'
import imageUrlBuilder from '@sanity/image-url'
import {useClient} from 'sanity'

// How a row of photos looks inside the article in the Studio: the photos side by
// side at equal width, in the order they will appear (left to right), with a
// short line under them saying how many there are.
export function ImageRowPreview(props) {
  const {images = [], subtitle} = props
  const client = useClient({apiVersion: '2025-02-19'})
  const builder = imageUrlBuilder(client)
  return (
    <Box padding={3}>
      <div style={{display: 'flex', gap: 8}}>
        {images.length === 0 && <Text size={1} muted>No photos yet</Text>}
        {images.map((image, i) =>
          image?.asset ? (
            <img
              key={image._key || i}
              src={builder.image(image).width(360).height(240).fit('crop').url()}
              alt={image.alt || ''}
              style={{flex: 1, minWidth: 0, aspectRatio: '3 / 2', objectFit: 'cover', borderRadius: 4, background: 'rgba(128,128,128,0.2)'}}
            />
          ) : (
            <div key={image?._key || i} style={{flex: 1, aspectRatio: '3 / 2', borderRadius: 4, background: 'rgba(128,128,128,0.2)'}} />
          ),
        )}
      </div>
      <Box marginTop={2}>
        <Text size={1} muted>{subtitle}</Text>
      </Box>
    </Box>
  )
}
