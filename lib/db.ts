// import { supabase } from './lib/supabaseClient'; // Disabled for Prisma migration

export async function query(sql: string) {
  // Function disabled during Prisma migration
  console.warn('Database query function disabled during Prisma migration:', sql);
  return [];
}