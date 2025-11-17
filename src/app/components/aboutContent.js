'use client'

import { createClient } from '@sanity/client';
import {PortableText} from '@portabletext/react'
import urlBuilder from '@sanity/image-url'
import {getImageDimensions} from '@sanity/asset-utils'
import { useState, useEffect } from "react";

const builder = urlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
})

// Barebones lazy-loaded image component
const SampleImageComponent = ({value, isInline}) => {
  const {width, height} = getImageDimensions(value)
  return (
    <img
      src={builder
        .image(value)
        .width(800)
        .fit('max')
        .auto('format')
        .url()}

      alt={value.alt || ' '}
      loading="lazy"
    />
  )
}

const components = {
  types: {
    image: SampleImageComponent,
  },
}

async function getContent() {
  const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: 'v2022-03-07'
  });

  try {
    let data = await client.fetch('*[_type == "page"][Title == "About"]');
    if (data.length > 0) {
      return data
    }
  } catch (error) {
    console.error('Data retrieval failed:', error);
    throw error;
  }
}

export default function AboutContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getContent()
        setContent(data)
      } catch (error) {
        console.error('Data retrieval failed:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col font-[family-name:var(--font-geist-sans)] min-h-[400px]">
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse text-3xl">🎨</div>
        </div>
      ) : (
        content.map((item, index) => (
          <div className="prose max-w-none" key={index}>
            <h1>{item.Header}</h1>
            <PortableText
              value={item.Content}
              components={components}
            />
          </div>
        ))
      )}
    </div>
  );
}
