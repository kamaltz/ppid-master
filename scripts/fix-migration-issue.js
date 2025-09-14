const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixMigrationIssue() {
  try {
    console.log('🔧 Fixing migration issue...');
    
    // 1. Delete the problematic migration file
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20241220000001_fix_settings_structure');
    if (fs.existsSync(migrationPath)) {
      console.log('1. Removing problematic migration...');
      fs.rmSync(migrationPath, { recursive: true, force: true });
      console.log('✓ Problematic migration removed');
    }
    
    // 2. Reset migration history in database
    console.log('2. Resetting migration history...');
    try {
      execSync('npx prisma migrate resolve --rolled-back 20241220000001_fix_settings_structure', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } catch (error) {
      console.log('Migration resolve failed, continuing...');
    }
    
    // 3. Drop all tables and start fresh
    console.log('3. Dropping all tables...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);
      console.log('✓ All tables dropped');
    } catch (error) {
      console.log('Drop tables failed:', error.message);
    } finally {
      await prisma.$disconnect();
    }
    
    // 4. Reset migration history
    console.log('4. Resetting migration history...');
    try {
      execSync('npx prisma migrate reset --force --skip-seed', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } catch (error) {
      console.log('Migration reset failed, continuing...');
    }
    
    // 5. Deploy migrations
    console.log('5. Deploying migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // 6. Generate Prisma client
    console.log('6. Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    // 7. Run seed
    console.log('7. Running seed...');
    execSync('npm run seed', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('🎉 Database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixMigrationIssue();