import type { Config } from 'tailwindcss'

import { colors } from './src/styles/colors'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        card: 'var(--card)',
        border: 'var(--border)',
        input: 'var(--input)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        gray: colors.gray,
        blue: colors.blue,
        green: colors.green,
        red: colors.red,
        yellow: colors.yellow,
      },
      backgroundColor: {
        DEFAULT: 'var(--background)',
      },
      textColor: {
        DEFAULT: 'var(--foreground)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
