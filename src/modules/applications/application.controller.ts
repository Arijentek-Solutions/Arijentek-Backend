import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const submitApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.params.jobId as string;
        const { firstName, lastName, email, phone, linkedIn, portfolio, coverLetter } = req.body;
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        const application = await prisma.application.create({
            data: { firstName, lastName, email, phone, linkedIn, portfolio, coverLetter, jobId },
        });
        res.status(201).json({ message: 'Application submitted', application });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: {
                name: (error as any).name,
                message: (error as any).message
            }
        });
    }
};

export const getApplications = async (_req: Request, res: Response): Promise<void> => {
    try {
        const applications = await prisma.application.findMany({
            include: {
                job: {
                    select: {
                        slug: true,
                        title: true,
                        department: true,
                        location: true,
                        type: true,
                        description: true,
                        qualification: true,
                        responsibilities: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: {
                name: (error as any).name,
                message: (error as any).message
            }
        });
    }
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    select: {
                        slug: true,
                        title: true,
                        department: true,
                        location: true,
                        type: true,
                        description: true,
                        qualification: true,
                        responsibilities: true
                    }
                }
            }
        });
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: {
                name: (error as any).name,
                message: (error as any).message
            }
        });
    }
};