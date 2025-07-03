'use client'

import { createClient } from '@sanity/client';
import {PortableText} from '@portabletext/react'
import urlBuilder from '@sanity/image-url'
import {getImageDimensions} from '@sanity/asset-utils'
import { useState, useEffect } from "react";
import getContent from './getContent';


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
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
}

export default function About() {

  const [content, setContent] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getContent()
        console.log(data)
        setContent(data)
      } catch (error) {
        console.error('Data retrieval failed:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col px-4 sm:px-4 font-[family-name:var(--font-geist-sans)]">
      {content.map((item, index) => (
        <div className="prose" key={index}>
          <h1>{item.Header}</h1>
          <PortableText
            value={item.Content}
            components={components}
          />
        </div>
      ))}
    </div>
  );
}
