import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ItemModel } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        await dbConnect();
        
        const updated = await ItemModel.findByIdAndUpdate(
            params.id,
            { ...body },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const obj = updated.toObject() as any;
        obj.id = obj._id.toString();
        delete obj._id;
        delete obj.__v;

        return NextResponse.json(obj);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        await ItemModel.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}