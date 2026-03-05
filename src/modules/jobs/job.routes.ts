import { Router } from 'express';
import { getJobs, getJobBySlug, createJob, updateJob, deleteJob, getJobById, getAdminJobs } from './job.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/slug/:slug', getJobBySlug);

export const adminJobRoutes = Router();
adminJobRoutes.get("/", authenticate, getAdminJobs);
adminJobRoutes.get('/:id', authenticate, getJobById);
adminJobRoutes.post('/', authenticate, createJob);
adminJobRoutes.put('/:id', authenticate, updateJob);
adminJobRoutes.delete('/:id', authenticate, deleteJob);

export { router as jobRoutes };