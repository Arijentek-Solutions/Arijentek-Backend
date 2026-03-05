import { Router } from 'express';
import {
    submitApplication,
    getApplications,
    getApplicationById,
} from './application.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/:jobId', submitApplication);
router.get('/admin', authenticate, getApplications);
router.get('/admin/:id', authenticate, getApplicationById);

export { router as applicationRoutes };