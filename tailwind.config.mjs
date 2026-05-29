/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#000000',
          secondary: 'rgba(255,255,255,0.04)',
          tertiary: 'rgba(255,255,255,0.08)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.62)',
          tertiary: 'rgba(255,255,255,0.42)',
        },
        accent: {
          DEFAULT: '#3289FF',
          soft: 'rgba(50,137,255,0.16)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
      letterSpacing: {
        tighter: '-0.5px',
      },
      lineHeight: {
        body: '1.7',
      },
      fontSize: {
        'h1-d': ['48px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        'h2-d': ['32px', { lineHeight: '1.3', letterSpacing: '-0.5px' }],
        'h3-d': ['22px', { lineHeight: '1.4', letterSpacing: '-0.5px' }],
      },
    },
  },
  plugins: [],
};
