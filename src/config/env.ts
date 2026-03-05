import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};