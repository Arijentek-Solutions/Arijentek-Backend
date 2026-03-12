import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import slugify from 'slugify';

const sanitizeJob = (job: any) => ({
    slug: job.slug.replace(/-\d+$/, ''),
    title: job.title.replace(/\s+\d+$/, ''),
    department: job.department,
    location: job.location,
    type: job.type,
    description: job.description,
    qualification: job.qualification,
    responsibilities: job.responsibilities,
    id: job.id,
    applicationsCount: job._count?.applications ?? 0
});

export const getJobs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await prisma.job.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs.map(sanitizeJob));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAdminJobs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs.map(sanitizeJob));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getJobBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const job = await prisma.job.findFirst({
            where: {
                slug: { startsWith: req.params.slug as string }
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        res.json(sanitizeJob(job));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id as string } });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        res.json(sanitizeJob(job));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, department, location, type, qualification, responsibilities, description } = req.body;
        const slug = slugify(title, { lower: true, strict: true });
        const job = await prisma.job.create({
            data: { title, slug, department, location, type, qualification, responsibilities, description },
        });
        res.status(201).json(sanitizeJob(job));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });5
    }
};


export const updateJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, department, location, type, qualification, responsibilities, description, status } = req.body;
        const data: any = { title, department, location, type, qualification, responsibilities, description, status };

        // Remove undefined fields
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        const job = await prisma.job.update({
            where: { id: req.params.id as string },
            data,
        });
        res.json(sanitizeJob(job));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.job.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
