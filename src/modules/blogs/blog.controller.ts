import { Request, Response } from 'express';
import { BlogStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { env } from '../../config/env';

import slugify from 'slugify';

import { uploadBlogImageToS3, getPresignedUrl } from '../../middlewares/upload.middleware';

const sanitizeBlog = async (blog: any) => {
    let imageUrl = blog.featuredImage;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        if (imageUrl.startsWith('blog-images/')) {
            imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${imageUrl}`;
        } else {
            imageUrl = await getPresignedUrl(imageUrl);
        }
    }
    
    return {
        ...blog,
        featuredImage: imageUrl
    };
};

const generateUniqueSlug = async (title: string) => {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let counter = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter++;
    }
    return slug;
};


export const getBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, category } = req.query;
        const where: any = {};
        
        if (status) where.status = status;
        if (category) where.category = category;
        if (!req.path.includes('/admin') && !status) {
            where.status = 'PUBLISHED';
        }

        const blogs = await prisma.blog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        
        const sanitizedBlogs = await Promise.all(blogs.map(sanitizeBlog));
        res.json(sanitizedBlogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAdminBlogs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
        });
        const sanitizedBlogs = await Promise.all(blogs.map(sanitizeBlog));
        res.json(sanitizedBlogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const isAdmin = req.path.includes('/admin');
        
        const blog = await prisma.blog.findUnique({
            where: { slug: slug as string }
        });
        
        if (!blog || (!isAdmin && blog.status !== BlogStatus.PUBLISHED)) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }
        
        res.json(await sanitizeBlog(blog));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, excerpt, content, category, author, readTime, status, featuredImage: providedImageUrl } = req.body;
        
        let featuredImage = providedImageUrl || '';
        
        if (req.file) {
            featuredImage = await uploadBlogImageToS3(req.file);
        }

        const upperStatus = status ? String(status).toUpperCase() : '';
        const validStatus = Object.values(BlogStatus).includes(upperStatus as BlogStatus) 
            ? (upperStatus as BlogStatus) 
            : BlogStatus.DRAFT;

        const slug = await generateUniqueSlug(title);
        
        const blog = await prisma.blog.create({
            data: { 
                title, 
                slug, 
                excerpt: excerpt || '', 
                content: content || '', 
                featuredImage, 
                category: category || 'General', 
                author: author || 'Admin', 
                readTime: readTime || '5 min', 
                status: validStatus
            },

        });
        
        res.status(201).json(await sanitizeBlog(blog));
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, excerpt, content, category, author, readTime, status, featuredImage: providedImageUrl } = req.body;
        
        const upperStatus = status ? String(status).toUpperCase() : undefined;
        let validStatus = undefined;
        if (upperStatus && Object.values(BlogStatus).includes(upperStatus as BlogStatus)) {
            validStatus = upperStatus as BlogStatus;
        }

        const data: any = { title, excerpt, content, category, author, readTime };
        if (validStatus) {
            data.status = validStatus;
        }

        if (req.file) {
            data.featuredImage = await uploadBlogImageToS3(req.file);
        } else if (providedImageUrl !== undefined) {
            data.featuredImage = providedImageUrl;
        }

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        const blog = await prisma.blog.update({
            where: { id: req.params.id as string },
            data,
        });
        
        res.json(await sanitizeBlog(blog));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.blog.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
