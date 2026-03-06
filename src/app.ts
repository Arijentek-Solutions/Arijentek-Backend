import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { adminRoutes } from './modules/admin/admin.routes';
import { jobRoutes, adminJobRoutes } from './modules/jobs/job.routes';
import { applicationRoutes } from './modules/applications/application.routes';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/admin', adminRoutes);
app.use('/api/admin/jobs', adminJobRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

export default app;