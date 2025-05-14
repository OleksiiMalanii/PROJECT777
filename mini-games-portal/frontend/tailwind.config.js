const colors = require('tailwindcss/colors')

module.exports = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        container: { center: true, padding: '1rem' },
        extend: {
            colors: {
                /* Нова світла палітра */
                background: '#E1EEBC',       // найсвітліший фон
                primary: {
                    DEFAULT: '#90C67C',        // базовий колір
                    light:   '#67AE6E',        // світлий відтінок
                    dark:    '#328E6E'         // темний відтінок
                },
                accent: '#67AE6E'            // додатковий акцент
            },
            fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'] },
            borderRadius: { '2xl': '1rem' },
            boxShadow:    { card: '0 10px 15px rgba(0,0,0,0.1)' }
        }
    },
    plugins: [require('@tailwindcss/forms')]
}