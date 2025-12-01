import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserModel } from '../lib/models';

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  (process as any).exit(1);
}

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    const username = 'admin';
    const password = 'admin'; // You can change this or pass it as an arg

    // Check if admin already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      console.log('⚠️ Admin user already exists.');
      (process as any).exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      role: 'admin',
      email: 'admin@example.com',
      fullName: 'System Administrator'
    });

    await newUser.save();
    console.log(`🎉 Admin user created successfully!`);
    console.log(`👤 Username: ${username}`);
    console.log(`📧 Email: admin@example.com`);
    console.log(`🔑 Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    (process as any).exit(0);
  }
};

createAdmin();