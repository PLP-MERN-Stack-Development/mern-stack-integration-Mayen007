// seed-categories.js - Create default categories for the blog
const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const defaultCategories = [
  {
    name: 'Technology',
    description: 'Posts about technology, programming, and software development'
  },
  {
    name: 'Lifestyle',
    description: 'Posts about lifestyle, travel, and personal experiences'
  },
  {
    name: 'Business',
    description: 'Posts about business, entrepreneurship, and marketing'
  },
  {
    name: 'Health',
    description: 'Posts about health, fitness, and wellness'
  },
  {
    name: 'Education',
    description: 'Posts about education, learning, and tutorials'
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('Categories already exist. Skipping seed.');
      return;
    }

    // Create default categories
    for (const categoryData of defaultCategories) {
      const category = new Category(categoryData);
      await category.save();
      console.log(`Created category: ${category.name}`);
    }

    console.log('All categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedCategories();