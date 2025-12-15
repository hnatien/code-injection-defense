/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                secure: {
                    black: '#0f172a',    // Dark Slate
                    dark: '#1e293b',     // Slate 800
                    light: '#f8fafc',
                    primary: '#10b981',  // Emerald Green 500
                    secondary: '#3b82f6', // Blue 500
                    accent: '#6366f1',   // Indigo 500
                    success: '#22c55e',
                    safe: '#059669',     // Emerald 600
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'shield-pattern': "radial-gradient(#3b82f6 1px, transparent 1px)",
            }
        },
    },
    plugins: [],
}
