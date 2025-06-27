/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontWeight: "400",
            },
            h2: {
              fontWeight: "400",
            },
            h3: {
              fontWeight: "400",
            },
            h4: {
              fontWeight: "400",
            },            
          },
        },
      },        
    },

  },
  plugins: [
    require('@tailwindcss/typography'),    
  ],
};
