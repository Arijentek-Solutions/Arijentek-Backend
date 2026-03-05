import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { env } from '../../config/env';


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const existing = await prisma.admin.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Admin already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.admin.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ message: 'Admin registered', adminId: admin.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign(
            { adminId: admin.id },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "logout successfully" });
    }
    catch (error) {
        console.log("something went wrong" + error)
        res.status(500).json({ message: "something went wrong" })
    }
}