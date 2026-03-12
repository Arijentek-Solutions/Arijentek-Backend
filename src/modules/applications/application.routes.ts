import { Router } from 'express';
import {
    submitApplication,
    getApplications,
    getApplicationById,
    deleteApplication,
} from './application.controller';
import { authenticate } from '../../middlewares/auth.middleware';

import { upload } from '../../middlewares/upload.middleware';

const router = Router();

router.post('/:jobId', upload.single('resume'), submitApplication);
router.get('/admin', authenticate, getApplications);
router.get('/admin/:id', authenticate, getApplicationById);
router.delete('/admin/:id', authenticate, deleteApplication);

export { router as applicationRoutes };