# Mi Despensa - Panel Administrativo 🏢

Este es el sistema administrativo web full-stack desarrollado a medida para la gestión unificada de empleados de **Mi Despensa** y su filial **Mi Contenedor**. Está diseñado para tener una interfaz moderna, limpia y altamente funcional.

## 🗂️ Estructura del Proyecto

```bash
📦 mi-despensa-dashboard
 ┣ 📂 backend     # API REST + Prisma ORM + PostgreSQL + Auth
 ┗ 📂 frontend    # React + Vite + Tailwind CSS + Zustand + Exportador Excel
```

## ✨ Características Principales

- **Gestión Dual de Empresas**: Registra, filtra y administra empleados separándolos por empresa (`Mi Despensa` o `Mi Contenedor`).
- **Control Detallado de Empleados**: Almacena nombres completos, cargos, y las fechas exactas de ingreso y egreso.
- **Exportación en Excel Avanzada**: Descarga reportes automáticos en `.xlsx` con columnas auto-ajustables, encabezados congelados y estilos visuales basados en la empresa de cada empleado.
- **Inicio de Sesión Seguro**: Acceso restringido por credenciales encriptadas, sistema de "Recordar Correo" y JWT de seguridad.
- **Diseño Responsivo (PWA)**: Preparado para utilizarse cómodamente tanto desde computadoras de escritorio como desde dispositivos móviles, e instalable como una App.

## 💻 Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js** (Escrito en TypeScript).
- **Prisma ORM**: Facilita de manera moderna las consultas a la base de datos.
- **PostgreSQL**: Base de datos segura montada en la nube usando *Neon*.
- **JWT & Bcrypt**: Para encriptado de contraseñas de administrador.

### Frontend
- **React.js** iniciado utilizando **Vite** (Rápido y ligero).
- **Tailwind CSS**: Para el diseño estético de interfaz de usuario.
- **Zustand**: Para manejo del esquema de estados (Variables globales).
- **ExcelJS**: Especial para general el archivo `.xlsx` estilizado de forma nativa.
- **Lucide React**: El set de íconos vectoriales modernos.

## 🚀 Requisitos y Configuración Local

1. Asegúrate de tener **Node.js** (v18 o superior) instalado en tu equipo.

### 1️⃣ Inicializar Backend
1. Navega a `cd backend`
2. Instala las dependencias necesarias: `npm install`
3. Asegúrate de tener tu archivo `.env` configurado así:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://neondb_owner:npg_J... tu conexión ..."
   JWT_SECRET="secret_mi_despensa_2026"
   ```
4. Genera el cliente e inicia el servidor de desarrollo:
   ```bash
   npx prisma generate
   npm run dev
   ```

### 2️⃣ Inicializar Frontend
1. Navega a `cd frontend`
2. Instala dependencias: `npm install`
3. Inicia la aplicación visual:
   ```bash
   npm run dev
   ```
4. Accede en el enlace proporcionado en consola (Usualmente `http://localhost:5173`).

---

**© 2026 Jesus Ruiz** - Desarrollado y refactorizado de forma exclusiva para Mi Despensa.
