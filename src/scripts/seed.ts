import { seedDatabase } from '../utils/seed';
import dotenv from 'dotenv';

// Load environment variables
// dotenv.config();

// Run the seed function
console.log('Starting database seeding process...');

seedDatabase()  
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  }); 