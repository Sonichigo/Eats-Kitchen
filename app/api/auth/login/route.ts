import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        
        await dbConnect();

        let user = await UserModel.findOne({ username });

        // AUTO-SEED: If trying to log in as 'admin' and it doesn't exist, create it automatically
        if (!user && username === 'admin') {
            console.log('Admin user not found. Auto-seeding default admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);
            
            user = await UserModel.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                email: 'admin@example.com',
                fullName: 'System Administrator'
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({ sub: user._id.toString(), role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h') // 1 Day Expiration
            .sign(secret);

        return NextResponse.json({ token, user: { name: user.fullName || user.username } });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}