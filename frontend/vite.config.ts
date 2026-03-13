import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['logo.png'],
            manifest: {
                name: 'Vikingos PRO',
                short_name: 'Vikingos',
                description: 'Panel administrativo para la Fundación Vikingos de Monagas',
                theme_color: '#050505',
                background_color: '#050505',
                display: 'standalone',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
})
