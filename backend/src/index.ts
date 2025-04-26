import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { connectDB } from './config/db';

import { startEmailScheduler } from './domains/mails/mail-scheduler.service';

import reviewRoutes from './domains/reviews/reviews.router';
import guestRoutes from './domains/guests/guests.router';
import userRoutes from './domains/users/users.router';
import openaiAssistantRoutes from './domains/openai-wrapper/openai-wrapper.router';
import taskRoutes from './domains/tasks/tasks.router';
import smsRoutes from './domains/sms/sms.router';
import eventRoutes from './domains/events/events.router';
import mailRoutes from './domains/mails/mail.router';
import invoiceRoutes from './domains/invoices/invoices.route';
import organizationRoutes from './domains/organizations/organizations.router';

dotenv.config();

export const SUBSCRIPTION_API_KEY =
  process.env.SUBSCRIPTION_API_KEY || 'default-subscription-key-change-in-prod';
export const ALLOWED_TILDA_ORIGINS = ['https://project123456.tilda.ws'];

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
app.use('/api/events', invoiceRoutes);
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
app.use('/api/sms', smsRoutes);
app.use('/api/organizations', organizationRoutes);

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

  startEmailScheduler();
  console.log('Email scheduler started');
});
