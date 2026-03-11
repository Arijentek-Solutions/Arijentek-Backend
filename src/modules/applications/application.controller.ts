import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { uploadToS3, getPresignedUrl } from '../../middlewares/upload.middleware';

export const submitApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.params.jobId as string;
        const { firstName, lastName, email, phone, linkedIn, portfolio, coverLetter } = req.body;
        
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        let resumeUrl = '';
        if (req.file) {
            resumeUrl = await uploadToS3(req.file);
        }

        const application = await prisma.application.create({
            data: { 
                firstName, 
                lastName, 
                email, 
                phone, 
                linkedIn, 
                portfolio, 
                coverLetter, 
                jobId,
                resumeUrl 
            },
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

    
        const applicationsWithUrls = await Promise.all(
            applications.map(async (app) => ({
                ...app,
                resumeUrl: app.resumeUrl ? await getPresignedUrl(app.resumeUrl) : ''
            }))
        );

        res.json(applicationsWithUrls);
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
        const resumeUrl = application.resumeUrl ? await getPresignedUrl(application.resumeUrl) : '';

        res.json({ ...application, resumeUrl });
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