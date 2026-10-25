import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Caption AI — Healthcare Social Captions',
    short_name: 'Caption AI',
    description: 'Turn everyday clinic updates and medical insights into authentic social media captions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#0284c7',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
