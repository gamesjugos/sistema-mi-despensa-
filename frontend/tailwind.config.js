/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable manual dark mode toggle if needed, or rely on system
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                dark: {
                    bg: '#0a0a0a', // Deep black
                    card: '#171717', // Slightly lighter black for cards
                    border: '#262626' // Minimalist dark border
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Professional sans-serif
            }
        },
    },
    plugins: [],
}
