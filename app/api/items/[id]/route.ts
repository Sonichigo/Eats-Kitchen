import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ItemModel } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        await dbConnect();
        
        let updateData = { ...body };
        
        if (body.title) {
            const currentItem = await ItemModel.findById(params.id);
            if (currentItem && currentItem.title !== body.title) {
                let baseSlug = slugify(body.title);
                let slug = baseSlug;
                let counter = 1;
                while (await ItemModel.findOne({ slug, _id: { $ne: params.id } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                updateData.slug = slug;
            }
        }

        const updated = await ItemModel.findByIdAndUpdate(
            params.id,
            updateData,
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
        console.error("Update Item Error:", error);
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