export type Category = 'recipe' | 'restaurant';

export interface BaseItem {
    id: string;
    title: string;
    description: string;
    imageUrl?: string; // Deprecated but kept for backward compatibility
    images?: string[]; // New: Multiple images
    createdAt: number;
}

export interface Recipe extends BaseItem {
    type: 'recipe';
    ingredients: string[];
    instructions: string[];
    prepTime: string;
}

export interface Review extends BaseItem {
    type: 'restaurant';
    rating: number; // 1-5
    location: string;
    priceRange: '$$' | '$$$' | '$$$$';
}

export type Item = Recipe | Review;

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;