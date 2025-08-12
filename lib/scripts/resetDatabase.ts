import clearDatabase from './clearDatabase';
import seedDatabase from './seedDatabase';

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...\n');
    
    await clearDatabase();
    console.log('');
    await seedDatabase();
    
    console.log('\n✅ Database reset completed!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default resetDatabase;