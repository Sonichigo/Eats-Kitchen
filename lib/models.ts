import mongoose, { Schema, model, models, Model } from 'mongoose';

// --- Item Schema (Recipes & Restaurants) ---
export interface IItem {
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  createdAt: number;
  type: 'recipe' | 'restaurant';
  ingredients?: string[];
  instructions?: string[];
  prepTime?: string;
  rating?: number;
  location?: string;
  priceRange?: '$$' | '$$$' | '$$$$';
}

const ItemSchema = new Schema<IItem>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, 
  images: { type: [String], default: [] },
  createdAt: { type: Number, default: Date.now },
  type: { type: String, required: true, enum: ['recipe', 'restaurant'] },
  
  // Specifics
  ingredients: { type: [String], default: undefined },
  instructions: { type: [String], default: undefined },
  prepTime: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  location: { type: String },
  priceRange: { type: String, enum: ['$$', '$$$', '$$$$'] }
});

// --- User Schema (Admin) ---
export interface IUser {
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  email?: string;
  fullName?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: false },
  fullName: { type: String, required: false }
});

// STABLE SINGLETON PATTERN
// Reuse existing models if they exist. Do NOT delete them in dev as it causes race conditions.
export const ItemModel = (models.Item as Model<IItem>) || model<IItem>('Item', ItemSchema);
export const UserModel = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);