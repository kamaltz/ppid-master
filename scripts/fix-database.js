const { execSync } = require('child_process');

console.log('Fixing database schema...');

try {
  console.log('1. Resetting database...');
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  
  console.log('2. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('3. Running migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('4. Seeding database...');
  execSync('node scripts/seed.mjs', { stdio: 'inherit' });
  
  console.log('Database fixed successfully!');
} catch (error) {
  console.error('Database fix failed:', error.message);
  process.exit(1);
}