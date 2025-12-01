import mongoose, { Schema, model, models, Model } from 'mongoose';

// --- Item Schema (Recipes & Restaurants) ---
export interface IItem {
  title: string;
  description: string;
  imageUrl?: string;
  images?: string[]; // New: Array of image strings
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
  // Base Fields
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, // Legacy
  images: { type: [String], default: [] }, // New: Store Base64 or URLs
  createdAt: { type: Number, default: Date.now },
  
  // Discriminator Key
  type: { type: String, required: true, enum: ['recipe', 'restaurant'] },
  
  // Recipe Specific Fields
  ingredients: { type: [String], default: undefined },
  instructions: { type: [String], default: undefined },
  prepTime: { type: String },

  // Restaurant Specific Fields
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
  password: { type: String, required: true }, // Store Hashed Passwords
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: false },
  fullName: { type: String, required: false }
});

// Helper to prevent recompilation errors in hot-reload environments
export const ItemModel = (models.Item as Model<IItem>) || model<IItem>('Item', ItemSchema);
export const UserModel = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);