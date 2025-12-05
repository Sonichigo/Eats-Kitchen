import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { ItemModel } from '@/lib/models';
import { Icons } from '@/components/ui/icons';

interface PageProps {
    params: { id: string };
}

export const dynamic = 'force-dynamic';

// 1. CACHED FETCHER: Prevents double DB calls (once for metadata, once for UI)
const getItem = cache(async (id: string) => {
    await dbConnect();
    const routeParam = decodeURIComponent(id);
    console.log(`[ItemPage] Lookup for: ${routeParam}`);

    let doc = null;
    try {
        // Try finding by Slug first (Exact String Match)
        doc = await ItemModel.findOne({ slug: routeParam }).lean();

        // If not found, and it looks like a valid MongoDB ObjectId, try ID lookup
        if (!doc && mongoose.isValidObjectId(routeParam)) {
            doc = await ItemModel.findById(routeParam).lean();
        }
    } catch (e) {
        console.error("DB Lookup Error:", e);
    }
    
    if (!doc) return null;

    // Serialize Mongoose POJO for Next.js
    return {
        ...(doc as any),
        id: (doc as any)._id.toString(),
        _id: undefined,
        __v: undefined
    };
});

// 2. DYNAMIC METADATA (SEO + BANNER)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const item = await getItem(params.id);
    
    if (!item) {
        return {
            title: 'Item Not Found | GourmetGuide',
            description: 'The requested recipe or review could not be found.'
        };
    }

    const images = item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []);
    const bannerImage = images[0] || '';

    return {
        title: `${item.title} | GourmetGuide`,
        description: item.description.substring(0, 160) + '...', // Truncate for SEO
        openGraph: {
            title: item.title,
            description: item.description.substring(0, 160),
            images: bannerImage ? [{ url: bannerImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: item.title,
            description: item.description.substring(0, 160),
            images: bannerImage ? [bannerImage] : [],
        }
    };
}

// 3. MAIN PAGE COMPONENT
export default async function ItemPage({ params }: PageProps) {
    const item = await getItem(params.id);

    if (!item) {
        console.log(`[ItemPage] 404 Not Found: ${params.id}`);
        return notFound();
    }

    const images = item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary text-white p-1.5 rounded-lg">
                            <Icons.Chef />
                        </div>
                        <span className="font-bold text-gray-900">GourmetGuide</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* BANNER / GALLERY SECTION */}
                    <div className="bg-gray-100 relative h-96 w-full group">
                         {images.length > 0 ? (
                            <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory hide-scrollbar">
                                {images.map((img: string, idx: number) => (
                                    <div key={idx} className="w-full flex-shrink-0 snap-center relative">
                                        <img 
                                            src={img} 
                                            alt={`${item.title} - Image ${idx + 1}`} 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                            {idx + 1} / {images.length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                <span className="flex items-center gap-2">
                                    <Icons.Restaurant /> No Image Available
                                </span>
                            </div>
                         )}
                         
                         {/* Category Badge */}
                         <div className="absolute top-4 left-4 z-10">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg backdrop-blur-md ${item.type === 'recipe' ? 'bg-orange-500/90' : 'bg-blue-500/90'}`}>
                                {item.type === 'recipe' ? 'Recipe' : 'Restaurant Review'}
                            </span>
                         </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b pb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{item.title}</h1>
                                
                                {item.type === 'restaurant' && (
                                    <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                                        <span className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                                            ⭐ {item.rating} / 5 Rating
                                        </span>
                                        <span className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                                            💵 {item.priceRange} Price
                                        </span>
                                        <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                            📍 {item.location}
                                        </span>
                                    </div>
                                )}
                                
                                {item.type === 'recipe' && (
                                     <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                                        <span className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                                            🕒 Prep: {item.prepTime}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-gray-400 font-medium">
                                Posted on {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">About</h3>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {item.description}
                                    </div>
                                </section>

                                {item.type === 'recipe' && item.instructions && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">Instructions</h3>
                                        <ol className="space-y-4">
                                            {item.instructions.map((step: string, i: number) => (
                                                <li key={i} className="flex gap-4">
                                                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-gray-700 mt-1">{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </section>
                                )}
                            </div>

                            <div className="lg:col-span-1">
                                {item.type === 'recipe' && item.ingredients && (
                                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 sticky top-24 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Icons.Chef /> Ingredients
                                        </h3>
                                        <ul className="space-y-3">
                                            {item.ingredients.map((ing: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                                                    {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {item.type === 'restaurant' && (
                                     <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 sticky top-24 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Icons.Restaurant /> Details
                                        </h3>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <span className="block text-blue-800 font-semibold mb-1">Location</span>
                                                <span className="text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-100 block">{item.location}</span>
                                            </div>
                                            <div>
                                                <span className="block text-blue-800 font-semibold mb-1">Price Range</span>
                                                <span className="text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-100 block">
                                                    {item.priceRange === '$$$$' ? 'Luxury' : item.priceRange === '$$$' ? 'Expensive' : 'Moderate'} ({item.priceRange})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}