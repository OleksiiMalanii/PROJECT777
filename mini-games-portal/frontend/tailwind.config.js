const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        container: { center: true, padding: '1rem' },
        extend: {
            colors: {
                primary: { DEFAULT: '#4F46E5', light: '#818CF8', dark: '#4338CA' },
                accent: colors.teal
            },
            fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
            borderRadius: { '2xl': '1rem' },
            boxShadow: { card: '0 10px 15px rgba(0,0,0,0.1)' }
        }
    },
    plugins: [require('@tailwindcss/forms')]
}