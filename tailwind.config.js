/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdba74', 400: '#fb923c', 500: '#f97316',
          600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
        },
        ink: {
          50:  '#f8f7f4', 100: '#f0ede6', 200: '#e2ddd2',
          300: '#ccc4b3', 400: '#b0a490', 500: '#9a8e79',
          600: '#837769', 700: '#6c6057', 800: '#5a5049', 900: '#1a1410',
        },
        // Vehicle accent colors
        bike: { light: '#fef3c7', mid: '#fbbf24', dark: '#d97706', text: '#92400e' },
        auto: { light: '#dbeafe', mid: '#60a5fa', dark: '#2563eb', text: '#1e3a8a' },
        ride: { light: '#d1fae5', mid: '#34d399', dark: '#059669', text: '#064e3b' },
        // Extra accent
        violet: { light: '#ede9fe', mid: '#8b5cf6', dark: '#6d28d9' },
        coral: { light: '#ffe4e6', mid: '#fb7185', dark: '#e11d48' },
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 9s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.5s ease-out both',
        'slide-up-sm': 'slideUpSm 0.4s ease-out both',
        'fade-in':     'fadeIn 0.6s ease-out both',
        'scale-in':    'scaleIn 0.3s ease-out both',
        'blob':        'blob 8s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'spin-slow':   'spin 12s linear infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-18px)' } },
        slideUp:  { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideUpSm:{ from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:  { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        blob:     {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%':     { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'premium':    '0 4px 40px rgba(249,115,22,0.18)',
        'card':       '0 2px 20px rgba(26,20,16,0.07)',
        'card-hover': '0 12px 40px rgba(26,20,16,0.14)',
        'glow-brand': '0 0 24px rgba(249,115,22,0.35)',
        'glow-blue':  '0 0 24px rgba(96,165,250,0.35)',
        'glow-green': '0 0 24px rgba(52,211,153,0.35)',
        'inner-sm':   'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(var(--tw-gradient-stops))',
      },
      transitionDelay: { '150': '150ms', '300': '300ms', '500': '500ms' },
    },
  },
  plugins: [],
}
