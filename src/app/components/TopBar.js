'use client'

import { PortableText } from '@portabletext/react'

const portableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="underline hover:no-underline"
        >
          {children}
        </a>
      )
    },
  },
}

export default function TopBar({ settings }) {
  if (!settings?.topBar?.enabled || !settings?.topBar?.text) {
    return null
  }

  const { text, backgroundColor } = settings.topBar
  const bgColorClass = `bg-${backgroundColor}`

  return (
    <div className={`${bgColorClass} text-black text-center py-2 px-4 text-sm`}>
      <div className="max-w-7xl mx-auto">
        <PortableText value={text} components={portableTextComponents} />
      </div>
    </div>
  )
}
