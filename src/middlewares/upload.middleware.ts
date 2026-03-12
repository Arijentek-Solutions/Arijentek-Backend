import multer from 'multer';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { env } from '../config/env';
import crypto from 'crypto';
import path from 'path';

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (_req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only resumes (.pdf, .doc, .docx) and images (.jpg, .jpeg, .png, .webp) are allowed'));
        }
    },
});

/**
 * Uploads a file to S3 with private access.
 * @returns The S3 Key (file path) for the resume.
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `resumes/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return fileName;
};

/**
 * Uploads a blog image to S3.
 * @returns The S3 Key (file path) for the image.
 */
export const uploadBlogImageToS3 = async (file: Express.Multer.File): Promise<string> => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `blog-images/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return fileName;
};

export const getPresignedUrl = async (key: string): Promise<string> => {
    if (!key) return '';

    const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 900 });
};