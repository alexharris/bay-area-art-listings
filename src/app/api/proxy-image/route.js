export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Only allow http/https URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BayAreaArtListings/1.0)',
      },
    });

    if (!response.ok) {
      return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new Response('URL does not point to an image', { status: 400 });
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Proxy image error:', err);
    return new Response('Failed to fetch image', { status: 500 });
  }
}
