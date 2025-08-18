// Reset admin password
import dotenv from 'dotenv';
dotenv.config();

// import { supabase } from '../lib/supabaseClient'; // Disabled for Prisma migration
// import bcrypt from 'bcryptjs'; // Disabled for Prisma migration

const resetAdminPassword = async () => {
  console.log('❌ Function disabled during Prisma migration');
  console.log('Please use: npm run seed to create default accounts');
};

resetAdminPassword();