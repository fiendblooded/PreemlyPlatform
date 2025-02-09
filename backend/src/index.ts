import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { connectDB } from './config/db';
import eventRoutes from './routes/event.routes';
import guestRoutes from './routes/guest.routes';
import userRoutes from './routes/user.routes';
import mailRoutes from './routes/mail.routes';
import guestImportRoutes from './routes/guest-import.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

connectDB();

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/guest-import', guestImportRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});