import mongoose, { Schema, model, models } from 'mongoose';

const ItemSchema = new Schema({
  // Base Fields
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
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

// Check if model exists to prevent recompilation errors in Next.js hot reloading
// Note: This code runs on the server side
export const ItemModel = models.Item || model('Item', ItemSchema);
