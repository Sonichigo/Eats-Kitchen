import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ItemModel } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        // Sort by newest first
        const items = await ItemModel.find({}).sort({ createdAt: -1 });
        
        // Transform _id to id for frontend compatibility
        const transformed = items.map(doc => {
            const obj = doc.toObject() as any;
            obj.id = obj._id.toString();
            delete obj._id;
            delete obj.__v;
            return obj;
        });

        return NextResponse.json(transformed);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        await dbConnect();
        
        const newItem = await ItemModel.create({
            ...body,
            createdAt: Date.now()
        });

        const obj = (newItem as any).toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        delete obj.__v;

        return NextResponse.json(obj, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}