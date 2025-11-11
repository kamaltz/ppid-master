import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLocalhostUrls() {
  console.log('🔧 Fixing localhost URLs in database...');

  try {
    // Get current settings
    const settings = await prisma.setting.findFirst();

    if (!settings) {
      console.log('❌ No settings found in database');
      return;
    }

    let updated = false;
    const newValue = { ...settings.value };

    // Fix general.logo
    if (newValue.general?.logo && typeof newValue.general.logo === 'string') {
      const oldLogo = newValue.general.logo;
      newValue.general.logo = oldLogo.replace(/^https?:\/\/localhost:\d+/, '');
      if (oldLogo !== newValue.general.logo) {
        console.log(`✅ Fixed logo: ${oldLogo} → ${newValue.general.logo}`);
        updated = true;
      }
    }

    // Fix general.favicon
    if (newValue.general?.favicon && typeof newValue.general.favicon === 'string') {
      const oldFavicon = newValue.general.favicon;
      newValue.general.favicon = oldFavicon.replace(/^https?:\/\/localhost:\d+/, '');
      if (oldFavicon !== newValue.general.favicon) {
        console.log(`✅ Fixed favicon: ${oldFavicon} → ${newValue.general.favicon}`);
        updated = true;
      }
    }

    // Fix hero images
    if (newValue.hero?.slides && Array.isArray(newValue.hero.slides)) {
      newValue.hero.slides = newValue.hero.slides.map((slide: any) => {
        if (slide.image && typeof slide.image === 'string') {
          const oldImage = slide.image;
          slide.image = oldImage.replace(/^https?:\/\/localhost:\d+/, '');
          if (oldImage !== slide.image) {
            console.log(`✅ Fixed hero image: ${oldImage} → ${slide.image}`);
            updated = true;
          }
        }
        return slide;
      });
    }

    if (updated) {
      await prisma.setting.update({
        where: { id: settings.id },
        data: { value: newValue }
      });
      console.log('✅ Database updated successfully!');
    } else {
      console.log('ℹ️  No localhost URLs found, database is clean');
    }

  } catch (error) {
    console.error('❌ Error fixing localhost URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLocalhostUrls();
