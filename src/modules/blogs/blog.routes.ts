import { Router } from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, getAdminBlogs } from './blog.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

export const adminBlogRoutes = Router();
adminBlogRoutes.get('/', authenticate, getAdminBlogs);
adminBlogRoutes.post('/', authenticate, upload.single('featuredImage'), createBlog);
adminBlogRoutes.put('/:id', authenticate, upload.single('featuredImage'), updateBlog);
adminBlogRoutes.delete('/:id', authenticate, deleteBlog);

export { router as blogRoutes };