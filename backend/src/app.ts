import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ─── Security Headers (ISO 27001) ───────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image loading
}));

// ─── CORS (Restrict in production) ──────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting (ISO 27001 - Brute force protection) ─────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas solicitudes. Por favor, intenta de nuevo en 15 minutos.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 15,                   // 15 login attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos de inicio de sesión. Por favor, espera 15 minutos.' },
    skipSuccessfulRequests: true,
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── HTTP Request Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check (ISO 25010 - Availability) ─────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
