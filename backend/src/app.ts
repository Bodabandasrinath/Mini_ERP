import express, { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck endpoint
app.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(res, { status: 'UP', timestamp: new Date().toISOString() }, 'Server health check passed');
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'API Route not found',
    errors: [],
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
