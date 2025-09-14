const { execSync } = require('child_process');

console.log('Resetting database completely...');

try {
  console.log('1. Clearing migration history...');
  execSync('rm -rf prisma/migrations || rmdir /s prisma\\migrations', { stdio: 'inherit' });
  
  console.log('2. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('3. Pushing schema to database...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  
  console.log('4. Seeding database...');
  execSync('node scripts/seed.mjs', { stdio: 'inherit' });
  
  console.log('Database reset completed successfully!');
} catch (error) {
  console.error('Database reset failed:', error.message);
  process.exit(1);
}