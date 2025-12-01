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

export async function GET() {
    try {
        await dbConnect();
        const items = await ItemModel.find({}).sort({ createdAt: -1 });
        
        const transformed = items.map(doc => {
            const obj = doc.toObject() as any;
            obj.id = obj._id.toString();
            if (!obj.slug) obj.slug = obj._id.toString(); 
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
        
        let baseSlug = slugify(body.title);
        let slug = baseSlug;
        let counter = 1;
        while (await ItemModel.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newItem = await ItemModel.create({
            ...body,
            slug,
            createdAt: Date.now()
        });

        const obj = (newItem as any).toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        delete obj.__v;

        return NextResponse.json(obj, { status: 201 });
    } catch (error) {
        console.error("Create Item Error:", error);
        return NextResponse.json({ error: 'Failed to create item. Payload might be too large.' }, { status: 500 });
    }
}