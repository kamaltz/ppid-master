const { execSync } = require('child_process');

console.log('Starting database setup...');

try {
  console.log('1. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('2. Running database migration...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('3. Seeding database...');
  execSync('node scripts/seed.mjs', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exit(1);
}