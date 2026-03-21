import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['recurso2.jpg'],
            manifest: {
                name: 'Mi Despensa Dashboard',
                short_name: 'Mi Despensa',
                description: 'Panel administrativo para la gestión de empleados de Mi Despensa y Mi Contenedor.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'recurso2.jpg',
                        sizes: '192x192',
                        type: 'image/jpeg'
                    },
                    {
                        src: 'recurso2.jpg',
                        sizes: '512x512',
                        type: 'image/jpeg'
                    }
                ]
            }
        })
    ],
})
