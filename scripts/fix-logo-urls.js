const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLogoUrls() {
  console.log('Fixing logo URLs in database...');
  
  try {
    // Get current general settings
    const generalSetting = await prisma.setting.findUnique({
      where: { key: 'general' }
    });

    if (generalSetting) {
      const settings = JSON.parse(generalSetting.value);
      
      // Fix logo URL to use relative path
      if (settings.logo && settings.logo.includes('localhost')) {
        settings.logo = '/logo-garut.svg';
        
        await prisma.setting.update({
          where: { key: 'general' },
          data: { value: JSON.stringify(settings) }
        });
        
        console.log('Logo URL fixed successfully!');
      } else {
        console.log('Logo URL is already correct.');
      }
    }
  } catch (error) {
    console.error('Error fixing logo URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLogoUrls();