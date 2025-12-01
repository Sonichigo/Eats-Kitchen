import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from './ui/icons';
import { Item, Category } from '../lib/types';

const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<Item>) => Promise<void>;
    initialData?: Item | null;
}

export function ItemModal({ isOpen, onClose, onSave, initialData }: ItemModalProps) {
    const [type, setType] = useState<Category>('recipe');
    const [submitting, setSubmitting] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    // Recipe Specific
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [prepTime, setPrepTime] = useState('');

    // Review Specific
    const [rating, setRating] = useState('5');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState<'$$' | '$$$' | '$$$$'>('$$');

    useEffect(() => {
        if (isOpen && initialData) {
            setType(initialData.type);
            setTitle(initialData.title);
            setDescription(initialData.description);
            setImageUrl(initialData.imageUrl || '');
            if (initialData.type === 'recipe') {
                setIngredients(initialData.ingredients.join('\n'));
                setInstructions(initialData.instructions.join('\n'));
                setPrepTime(initialData.prepTime);
            } else {
                setRating(initialData.rating.toString());
                setLocation(initialData.location);
                setPriceRange(initialData.priceRange);
            }
        } else if (isOpen && !initialData) {
            // Reset
            setTitle(''); setDescription(''); setImageUrl('');
            setIngredients(''); setInstructions(''); setPrepTime('');
            setRating('5'); setLocation(''); setPriceRange('$$');
            setType('recipe');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleAI = async () => {
        if (!aiPrompt) return;
        setAiThinking(true);
        try {
            if (type === 'recipe') {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate a recipe for "${aiPrompt}". Return ONLY valid JSON format with keys: title, description, ingredients (array of strings), instructions (array of strings), prepTime.`,
                    config: { responseMimeType: 'application/json' }
                });
                const data = JSON.parse(response.text);
                setTitle(data.title);
                setDescription(data.description);
                setIngredients(data.ingredients.join('\n'));
                setInstructions(data.instructions.join('\n'));
                setPrepTime(data.prepTime);
            } else {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Write a restaurant review for "${aiPrompt}". Return ONLY valid JSON format with keys: title, description, location (city/country), priceRange ($$ or $$$ or $$$$). Assume a high quality restaurant.`,
                    config: { responseMimeType: 'application/json' }
                });
                const data = JSON.parse(response.text);
                setTitle(data.title);
                setDescription(data.description);
                setLocation(data.location);
                setPriceRange(data.priceRange);
            }
        } catch (e) {
            console.error(e);
            alert("AI Generation failed. Please try again.");
        }
        setAiThinking(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;

        setSubmitting(true);
        try {
            const commonData = {
                title,
                description,
                imageUrl
            };

            if (type === 'recipe') {
                await onSave({
                    ...commonData,
                    type: 'recipe',
                    ingredients: ingredients.split('\n').filter(i => i),
                    instructions: instructions.split('\n').filter(i => i),
                    prepTime
                });
            } else {
                await onSave({
                    ...commonData,
                    type: 'restaurant',
                    rating: Number(rating),
                    location,
                    priceRange
                });
            }
            onClose();
        } catch (err) {
            alert('Failed to save item');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Entry' : 'Add New Entry'}</h2>
                    {!initialData && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setType('recipe')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'recipe' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>Recipe</button>
                            <button onClick={() => setType('restaurant')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'restaurant' ? 'bg-white shadow text-blue-500' : 'text-gray-500'}`}>Restaurant</button>
                        </div>
                    )}
                </div>

                <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Icons.Sparkles /> AI Auto-Fill
                    </label>
                    <div className="flex gap-2">
                        <input 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={type === 'recipe' ? "e.g., 'Spicy Thai Green Curry'" : "e.g., 'Gordon Ramsay Burger Las Vegas'"}
                            className="flex-1 px-4 py-2 bg-white rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        />
                        <button 
                            onClick={(e) => { e.preventDefault(); handleAI(); }}
                            disabled={aiThinking || !aiPrompt}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {aiThinking ? 'Thinking...' : 'Generate'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                        </div>

                        {type === 'recipe' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
                                    <input value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g. 30 mins" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (one per line)</label>
                                    <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (one per line)</label>
                                    <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <select value={rating} onChange={e => setRating(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none">
                                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <select value={priceRange} onChange={e => setPriceRange(e.target.value as any)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none">
                                        <option value="$$">$$ (Moderate)</option>
                                        <option value="$$$">$$$ (Expensive)</option>
                                        <option value="$$$$">$$$$ (Luxury)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg font-medium disabled:opacity-70">
                            {submitting ? 'Save Changes' : (initialData ? 'Update Entry' : 'Create Entry')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}