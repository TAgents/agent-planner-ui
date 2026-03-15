const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Accent palette
        amber: {
          50:  '#fdf8ef',
          100: '#fbefd5',
          200: '#f7dba4',
          300: '#f0c36e',
          400: '#d4a24e',
          500: '#b8882e',
          600: '#966b1d',
          700: '#7a5418',
          800: '#654417',
          900: '#553916',
        },
        teal: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6de',
          300: '#5ceac9',
          400: '#5ba89a',
          500: '#3d7a6e',
          600: '#2d6259',
          700: '#284f49',
          800: '#243f3c',
          900: '#223533',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Bricolage Grotesque', 'serif'],
        body: ['Figtree', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
    }
  },
  plugins: [
    // Warm Obsidian theme: remaps gray + blue in dark mode via CSS overrides
    // Uses addBase for CSS variables, addUtilities with !important for color overrides
    plugin(function({ addBase, addUtilities }) {
      // CSS variables — base layer is fine for these
      addBase({
        '.dark': {
          '--ob-50':  '#ede8df',
          '--ob-100': '#d4cfc5',
          '--ob-200': '#a09882',
          '--ob-300': '#8a8270',
          '--ob-400': '#6b6354',
          '--ob-500': '#4a4438',
          '--ob-600': '#2a261e',
          '--ob-700': '#1e1b15',
          '--ob-800': '#16140f',
          '--ob-900': '#0e0c0a',
          '--ob-950': '#0a0907',
        },
      });

      // All color overrides use !important to beat Tailwind utility classes
      const i = '!important';
      addUtilities({
        // Gray background overrides (non-prefixed)
        '.dark .bg-gray-50':   { 'background-color': `var(--ob-900) ${i}` },
        '.dark .bg-gray-100':  { 'background-color': `var(--ob-800) ${i}` },
        '.dark .bg-gray-200':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .bg-gray-700':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .bg-gray-800':  { 'background-color': `var(--ob-800) ${i}` },
        '.dark .bg-gray-900':  { 'background-color': `var(--ob-900) ${i}` },
        '.dark .bg-gray-950':  { 'background-color': `var(--ob-950) ${i}` },
        // Gray background overrides (dark:-prefixed)
        '.dark .dark\\:bg-gray-50':   { 'background-color': `var(--ob-900) ${i}` },
        // dark:bg-gray-100 used as inverted active state (light bg in dark mode) → warm cream
        '.dark .dark\\:bg-gray-100':  { 'background-color': `var(--ob-50) ${i}` },
        '.dark .dark\\:bg-gray-200':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .dark\\:bg-gray-700':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .dark\\:bg-gray-800':  { 'background-color': `var(--ob-800) ${i}` },
        '.dark .dark\\:bg-gray-900':  { 'background-color': `var(--ob-900) ${i}` },
        '.dark .dark\\:bg-gray-950':  { 'background-color': `var(--ob-950) ${i}` },
        // Gray background with opacity
        '.dark .dark\\:bg-gray-800\\/50': { 'background-color': `rgba(22, 20, 15, 0.5) ${i}` },
        '.dark .dark\\:bg-gray-800\\/80': { 'background-color': `rgba(22, 20, 15, 0.8) ${i}` },
        '.dark .dark\\:bg-gray-900\\/80': { 'background-color': `rgba(14, 12, 10, 0.8) ${i}` },
        '.dark .bg-gray-800\\/50': { 'background-color': `rgba(22, 20, 15, 0.5) ${i}` },
        '.dark .bg-gray-800\\/80': { 'background-color': `rgba(22, 20, 15, 0.8) ${i}` },
        // White background in dark mode
        '.dark .bg-white':  { 'background-color': `var(--ob-800) ${i}` },
        '.dark .dark\\:bg-white': { 'background-color': `var(--ob-800) ${i}` },
        // Gray text overrides
        '.dark .dark\\:text-gray-100': { 'color': `var(--ob-50) ${i}` },
        '.dark .dark\\:text-gray-200': { 'color': `var(--ob-100) ${i}` },
        '.dark .dark\\:text-gray-300': { 'color': `var(--ob-200) ${i}` },
        '.dark .dark\\:text-gray-400': { 'color': `var(--ob-400) ${i}` },
        '.dark .dark\\:text-gray-500': { 'color': `var(--ob-500) ${i}` },
        '.dark .dark\\:text-white':    { 'color': `var(--ob-50) ${i}` },
        '.dark .text-gray-900':        { 'color': `var(--ob-50) ${i}` },
        // Gray border overrides
        '.dark .dark\\:border-gray-600': { 'border-color': `var(--ob-600) ${i}` },
        '.dark .dark\\:border-gray-700': { 'border-color': `var(--ob-600) ${i}` },
        '.dark .dark\\:border-gray-800': { 'border-color': `var(--ob-600) ${i}` },
        '.dark .dark\\:border-gray-700\\/50': { 'border-color': `rgba(42, 38, 30, 0.5) ${i}` },
        '.dark .dark\\:border-gray-800\\/60': { 'border-color': `rgba(42, 38, 30, 0.6) ${i}` },
        '.dark .dark\\:border-gray-800\\/80': { 'border-color': `rgba(42, 38, 30, 0.8) ${i}` },
        '.dark .border-gray-200':     { 'border-color': `var(--ob-600) ${i}` },
        '.dark .border-gray-200\\/60': { 'border-color': `rgba(42, 38, 30, 0.6) ${i}` },
        '.dark .border-gray-300':     { 'border-color': `var(--ob-600) ${i}` },
        // Hover states
        '.dark .dark\\:hover\\:bg-gray-700:hover':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .dark\\:hover\\:bg-gray-800:hover':  { 'background-color': `var(--ob-700) ${i}` },
        '.dark .dark\\:hover\\:bg-gray-800\\/50:hover': { 'background-color': `rgba(22, 20, 15, 0.5) ${i}` },
        '.dark .hover\\:bg-gray-100:hover': { 'background-color': `var(--ob-700) ${i}` },
        // Non-prefixed gray text used in dark mode
        '.dark .text-gray-500': { 'color': `var(--ob-400) ${i}` },
        '.dark .text-gray-600': { 'color': `var(--ob-400) ${i}` },
        '.dark .text-gray-700': { 'color': `var(--ob-300) ${i}` },
        '.dark .text-white':    { 'color': `var(--ob-50) ${i}` },
        // Also fix dark:text-gray-900 used on active buttons (needs to stay dark on cream bg)
        '.dark .dark\\:text-gray-900': { 'color': `var(--ob-950) ${i}` },
        '.dark .dark\\:hover\\:bg-gray-200:hover': { 'background-color': `var(--ob-100) ${i}` },
        // Blue → amber in dark mode (dark:-prefixed)
        '.dark .dark\\:text-blue-400':  { 'color': `#d4a24e ${i}` },
        '.dark .dark\\:text-blue-500':  { 'color': `#b8882e ${i}` },
        '.dark .dark\\:hover\\:text-blue-400:hover': { 'color': `#d4a24e ${i}` },
        '.dark .dark\\:ring-blue-400':  { '--tw-ring-color': '#d4a24e' },
        '.dark .dark\\:ring-blue-500':  { '--tw-ring-color': '#b8882e' },
        '.dark .dark\\:bg-blue-900\\/20': { 'background-color': `rgba(85, 57, 22, 0.2) ${i}` },
        '.dark .dark\\:border-blue-700': { 'border-color': `#7a5418 ${i}` },
        '.dark .dark\\:hover\\:border-blue-700:hover': { 'border-color': `#7a5418 ${i}` },
        // Blue → amber in dark mode (non-prefixed)
        '.dark .bg-blue-500':  { 'background-color': `#b8882e ${i}` },
        '.dark .bg-blue-600':  { 'background-color': `#966b1d ${i}` },
        '.dark .bg-blue-700':  { 'background-color': `#7a5418 ${i}` },
        '.dark .hover\\:bg-blue-700:hover': { 'background-color': `#7a5418 ${i}` },
        '.dark .text-blue-500': { 'color': `#b8882e ${i}` },
        '.dark .text-blue-600': { 'color': `#d4a24e ${i}` },
        '.dark .hover\\:text-blue-600:hover': { 'color': `#d4a24e ${i}` },
        '.dark .hover\\:text-blue-800:hover': { 'color': `#d4a24e ${i}` },
        '.dark .bg-blue-50':   { 'background-color': `rgba(85, 57, 22, 0.15) ${i}` },
        '.dark .bg-blue-100':  { 'background-color': `rgba(85, 57, 22, 0.2) ${i}` },
        '.dark .text-blue-700': { 'color': `#d4a24e ${i}` },
        '.dark .ring-blue-500': { '--tw-ring-color': '#b8882e' },
        '.dark .focus\\:ring-blue-500:focus': { '--tw-ring-color': '#b8882e' },
        '.dark .border-blue-500': { 'border-color': `#b8882e ${i}` },
        '.dark .focus\\:border-blue-500:focus': { 'border-color': `#b8882e ${i}` },
        // Indigo → amber in dark mode (dark:-prefixed)
        '.dark .dark\\:text-indigo-300': { 'color': `#f0c36e ${i}` },
        '.dark .dark\\:text-indigo-400': { 'color': `#d4a24e ${i}` },
        '.dark .dark\\:from-indigo-900\\/50': { '--tw-gradient-from': 'rgba(85, 57, 22, 0.5)' },
        '.dark .dark\\:to-blue-900\\/50':     { '--tw-gradient-to': 'rgba(101, 68, 23, 0.5)' },
        // Indigo → amber in dark mode (non-prefixed)
        '.dark .bg-indigo-500':  { 'background-color': `#b8882e ${i}` },
        '.dark .bg-indigo-600':  { 'background-color': `#966b1d ${i}` },
        '.dark .hover\\:bg-indigo-700:hover': { 'background-color': `#7a5418 ${i}` },
        '.dark .text-indigo-600': { 'color': `#d4a24e ${i}` },
        '.dark .hover\\:text-indigo-700:hover': { 'color': `#d4a24e ${i}` },
        '.dark .bg-indigo-100': { 'background-color': `rgba(85, 57, 22, 0.2) ${i}` },
        '.dark .ring-indigo-500': { '--tw-ring-color': '#b8882e' },
        '.dark .focus\\:ring-indigo-500:focus': { '--tw-ring-color': '#b8882e' },
        // Placeholder colors
        '.dark .dark\\:placeholder-gray-600::placeholder': { 'color': `var(--ob-500) ${i}` },
        // Scrollbar
        '.dark ::-webkit-scrollbar-track': { 'background-color': 'var(--ob-800)' },
        '.dark ::-webkit-scrollbar-thumb': { 'background-color': 'var(--ob-600)', 'border-radius': '9999px' },
        '.dark ::-webkit-scrollbar-thumb:hover': { 'background-color': 'var(--ob-500)' },
        // Fill colors for SVGs
        '.dark .dark\\:fill-gray-300': { 'fill': `var(--ob-200) ${i}` },
        '.dark .fill-gray-700':        { 'fill': `var(--ob-200) ${i}` },
        // Stroke colors
        '.dark .dark\\:stroke-gray-500': { 'stroke': `var(--ob-500) ${i}` },
        '.dark .dark\\:stroke-blue-400': { 'stroke': `#d4a24e ${i}` },
        '.dark .stroke-gray-400':        { 'stroke': `var(--ob-500) ${i}` },
      });
    }),
  ],
}
