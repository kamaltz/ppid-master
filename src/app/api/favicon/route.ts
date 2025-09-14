import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export async function GET(request: NextRequest) {
  try {
    // Get favicon from settings
    const settings = await prisma.setting.findUnique({
      where: { key: 'general' }
    });
    
    if (settings?.value) {
      const generalSettings = JSON.parse(settings.value);
      if (generalSettings.favicon) {
        // Redirect to the actual favicon file with cache busting
        const timestamp = Date.now();
        const faviconUrl = `${generalSettings.favicon}?v=${timestamp}`;
        
        return NextResponse.redirect(new URL(faviconUrl, request.url), {
          status: 302,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    }
    
    // Fallback to default favicon
    return NextResponse.redirect(new URL('/logo-garut.svg', request.url));
  } catch (error) {
    console.error('Error serving favicon:', error);
    return NextResponse.redirect(new URL('/logo-garut.svg', request.url));
  }
}