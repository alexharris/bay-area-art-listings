import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'
import { createClient } from 'next-sanity'

export const runtime = 'nodejs'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-26',
  useCdn: false,
})

const fontBase = path.join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans')

let geistRegular = null
let geistBold = null

function loadFonts() {
  if (!geistRegular) geistRegular = fs.readFileSync(path.join(fontBase, 'Geist-Regular.ttf'))
  if (!geistBold) geistBold = fs.readFileSync(path.join(fontBase, 'Geist-Bold.ttf'))
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Missing id parameter', { status: 400 })
  }

  const listing = await sanityClient.fetch(
    `*[_id == $id][0]{
      Event,
      StartDate,
      EndDate,
      DateOverride,
      "locationName": Location->Name,
      "image": EventImageUpload {
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        crop
      }
    }`,
    { id }
  )

  if (!listing?.image?.url) {
    return new Response('No image found for this listing', { status: 404 })
  }

  loadFonts()

  const dateRange = formatDateRange(listing.StartDate, listing.EndDate, listing.DateOverride)
  const imageUrl = buildCroppedImageUrl(listing.image, 1080, 945)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 1080,
          height: 1350,
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 1080,
            height: 945,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1080,
            height: 405,
            padding: '44px 52px 44px 52px',
            backgroundColor: 'white',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Geist',
              fontWeight: 700,
              fontSize: 54,
              color: '#000000',
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {listing.Event}
          </div>

          {listing.locationName ? (
            <div
              style={{
                fontFamily: 'Geist',
                fontWeight: 400,
                fontSize: 38,
                color: '#444444',
                marginBottom: 12,
              }}
            >
              {listing.locationName}
            </div>
          ) : null}

          {dateRange ? (
            <div
              style={{
                fontFamily: 'Geist',
                fontWeight: 400,
                fontSize: 34,
                color: '#888888',
              }}
            >
              {dateRange}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        {
          name: 'Geist',
          data: geistRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: geistBold,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}

function buildCroppedImageUrl(image, outputW, outputH) {
  const { url, width, height, crop } = image
  const hasCrop = crop && (crop.left || crop.right || crop.top || crop.bottom)

  if (!hasCrop) {
    return `${url}?w=${outputW}&h=${outputH}&fit=crop`
  }

  const left = Math.round((crop.left ?? 0) * width)
  const top = Math.round((crop.top ?? 0) * height)
  const rectW = Math.round((1 - (crop.left ?? 0) - (crop.right ?? 0)) * width)
  const rectH = Math.round((1 - (crop.top ?? 0) - (crop.bottom ?? 0)) * height)

  return `${url}?rect=${left},${top},${rectW},${rectH}&w=${outputW}&h=${outputH}&fit=crop`
}

function formatDateRange(startDate, endDate, dateOverride) {
  if (dateOverride) return dateOverride

  const formatShort = (dateStr) => {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })
  }

  const formatFull = (dateStr) => {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (startDate && endDate) {
    const startYear = startDate.split('-')[0]
    const endYear = endDate.split('-')[0]
    if (startYear === endYear) {
      return `${formatShort(startDate)} – ${formatFull(endDate)}`
    }
    return `${formatFull(startDate)} – ${formatFull(endDate)}`
  }

  return formatFull(startDate) || formatFull(endDate) || ''
}
