export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/dashboard', '/styleguide', '/list', '/show', '/api'],
    },
    sitemap: 'https://artboard.info/sitemap.xml',
  };
}
