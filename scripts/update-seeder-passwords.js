const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function updateSeederPasswords() {
  try {
    console.log('🔐 Mengupdate password di seeder files...');
    
    const newPassword = process.argv[2] || 'Garut@2025?';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update seed.js file
    const seedPath = path.join(__dirname, '../prisma/seed.js');
    
    if (fs.existsSync(seedPath)) {
      let seedContent = fs.readFileSync(seedPath, 'utf8');
      
      // Replace old password hashes with new one
      seedContent = seedContent.replace(
        /password:\s*await\s*bcrypt\.hash\(['"`][^'"`]*['"`],\s*12\)/g,
        `password: await bcrypt.hash('${newPassword}', 12)`
      );
      
      // Replace direct password strings
      seedContent = seedContent.replace(
        /password:\s*['"`](admin123|ppid123|pemohon123|123456)['"`]/g,
        `password: '${newPassword}'`
      );
      
      fs.writeFileSync(seedPath, seedContent);
      console.log('✅ File prisma/seed.js berhasil diupdate');
    }
    
    // Update any other seeder files in lib/scripts
    const scriptsDir = path.join(__dirname, '../lib/scripts');
    
    if (fs.existsSync(scriptsDir)) {
      const files = fs.readdirSync(scriptsDir).filter(file => 
        file.endsWith('.js') || file.endsWith('.ts')
      );
      
      files.forEach(file => {
        const filePath = path.join(scriptsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace password patterns
        const updated = content.replace(
          /password:\s*await\s*bcrypt\.hash\(['"`][^'"`]*['"`],\s*12\)/g,
          `password: await bcrypt.hash('${newPassword}', 12)`
        );
        
        if (updated !== content) {
          fs.writeFileSync(filePath, updated);
          console.log(`✅ File ${file} berhasil diupdate`);
        }
      });
    }
    
    console.log(`🔑 Password baru untuk seeder: ${newPassword}`);
    console.log('⚠️  Jalankan "npm run seed" untuk apply perubahan ke database');
    
    return { success: true, newPassword };
    
  } catch (error) {
    console.error('❌ Error mengupdate seeder:', error);
  }
}

updateSeederPasswords();