import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { connectDB } from './config/db';
import eventRoutes from './routes/event.routes';
import reviewRoutes from './routes/reviews.routers';
import guestRoutes from './routes/guest.routes';
import mailRoutes from './routes/mail.routes';
import userRoutes from './routes/user.routes';
import openaiAssistantRoutes from './routes/openai-assistant.routes';
import taskRoutes from './routes/task.routes';
import { startEmailScheduler } from './services/email-scheduler.service';

dotenv.config();

const app: Application = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://platform.preemly.eu', 'https://localhost:5173', 'http://localhost:5173'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use((req, res, next) => {
  if (req.url.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  }
  next();
});
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/openai', openaiAssistantRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'CORS: Access denied' });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT:${PORT}`);

  // Start the email scheduler
  startEmailScheduler();
  console.log('Email scheduler started');
});
