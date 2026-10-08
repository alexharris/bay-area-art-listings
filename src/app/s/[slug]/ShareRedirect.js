'use client'

import { useEffect } from 'react';

// Client-side so social crawlers (which don't run JS) stay on the share page and read its tags
export default function ShareRedirect({ href }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return null;
}
