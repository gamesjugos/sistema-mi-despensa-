# Vikingos Dashboard de Gestión Deportiva 🏀

Este es el proyecto full-stack para la gestión de jugadores de baloncesto del equipo Vikingos, desarrollado con un backend en Node (Express, TypeScript, Prisma, PostgreSQL) y un frontend en React (Vite, TailwindCSS).

## 🗂️ Estructura del Proyecto

```bash
📦 vikingos-dashboard
 ┣ 📂 backend     # API REST + Prisma + JWT Auth
 ┗ 📂 frontend    # React + Vite + Tailwind + FullCalendar
```

## 🚀 Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: Instancia local o en la nube (ej. Render, Supabase)
- **Git**

## 💻 Desarrollo Local

### 1️⃣ Backend
1. Entra a `cd backend`
2. Instala dependencias: `npm install`
3. Configura `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/vikingos?schema=public"
   JWT_SECRET="secret"
   ```
4. Genera el cliente y sincroniza la DB:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Inicia en desarrollo: `npm run dev`

### 2️⃣ Frontend
1. Entra a `cd frontend`
2. Instala dependencias: `npm install`
3. Inicia la app: `npm run dev`

## 🌍 Guía de Despliegue en Render (Producción)

Render es excelente para el stack MERN/PERN. Dividiremos el despliegue en dos partes: un servicio Web Service (Backend) y un Static Site (Frontend).

### Paso 1: Configurar PostgreSQL en Render
1. En Dashboard de Render: **New > PostgreSQL**.
2. Ponle nombre (ej: `vikingos-db`) y selecciona la región más cercana.
3. Copia la URL de conexión interna (para el backend) o externa.

### Paso 2: Desplegar el Backend (Web Service)
1. En Render: **New > Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configuración del servicio:
   - **Name**: `vikingos-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. Agrega las **Environment Variables**:
   - `DATABASE_URL`: (Pega la URL del Postgres de Render)
   - `JWT_SECRET`: (Genera un token seguro)
   - `PORT`: 5000
5. Despliega (Deploy).

### Paso 3: Desplegar el Frontend (Static Site o Web Service)
1. En Render: **New > Static Site**.
2. Conecta el repositorio de GitHub.
3. Configuración:
   - **Name**: `vikingos-dashboard`
   - **Build Command**: `npm install && npm run build`
   - **Publish directory**: `dist`
4. En Avanzado (Advanced), agrega Reglas de Redirección (Redirect/Rewrite Routes) para el SPA Router:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Configura la **Variable de Entorno** para conectarse al backend:
   - `VITE_API_URL`: (La URL de tu API, ej: `https://vikingos-api.onrender.com/api`)
6. Despliega (Deploy).

¡Listo! Ya tendrás tu Dashboard Professional corriendo.
