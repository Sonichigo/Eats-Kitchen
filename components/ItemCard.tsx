import React, { useState } from 'react';
import { Icons } from './ui/icons';
import { Item } from '../lib/types';

interface ItemCardProps {
    item: Item;
    onDelete: (id: string) => void;
    onEdit: (item: Item) => void;
    isLoggedIn: boolean;
}

export function ItemCard({ item, onDelete, onEdit, isLoggedIn }: ItemCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm('Delete this item?')) return;
        
        setIsDeleting(true);
        try {
            await onDelete(item.id);
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
            alert('Failed to delete item.');
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(item);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full">
            <div className="h-48 overflow-hidden relative bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                    <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                
                <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm ${item.type === 'recipe' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {item.type === 'recipe' ? 'Recipe' : 'Review'}
                     </span>
                </div>
                {isLoggedIn && (
                    <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={handleEdit}
                            className="p-2 bg-white text-blue-500 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                            title="Edit"
                        >
                            <Icons.Pencil />
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            title="Delete"
                        >
                            {isDeleting ? '...' : <Icons.Trash />}
                        </button>
                    </div>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                
                {item.type === 'restaurant' && (
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                        <span>⭐ {item.rating}/5</span>
                        <span>{item.priceRange}</span>
                        <span className="truncate max-w-[100px]">{item.location}</span>
                    </div>
                )}
                {item.type === 'recipe' && (
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                        <span>🕒 {item.prepTime}</span>
                        <span>🥘 {item.ingredients.length} ingredients</span>
                    </div>
                )}
            </div>
        </div>
    );
}